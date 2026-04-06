"use server";

import { serverAction } from "../action";
import mysql from "mysql2/promise";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const crawlTweetsKeyword = serverAction(
  async (keyword: string) => {
    const db = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "root",
      database: "sentiment_twitter",
    });

    let inserted = 0;

    const query = `${keyword} lang:id -is:retweet`;

    // 🔥 panggil snscrape
    const { stdout } = await execAsync(
      `snscrape --jsonl --max-results 100 twitter-search "${query}"`
    );

    const tweets = stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    for (const tweet of tweets) {
      const username = tweet.user?.username || null;

      await db.query(
        `INSERT IGNORE INTO tweets (id, username, text, created_at, tweet_url)
         VALUES (?,?,?,?,?)`,
        [
          tweet.id,
          username,
          tweet.content,
          tweet.date,
          username
            ? `https://twitter.com/${username}/status/${tweet.id}`
            : null,
        ]
      );

      inserted++;
    }

    await db.end();
    return { inserted };
  },
  "CRAWL_KEYWORD"
);