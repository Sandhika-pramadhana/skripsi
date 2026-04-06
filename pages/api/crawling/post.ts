import { chromium, Page } from 'playwright';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_TOKEN = process.env.TWITTER_AUTH_TOKEN!;
const KEYWORD = '#kaburajadulu';
const LIMIT = 1000;

interface Tweet {
  id: string;
  username: string;
  text: string;
  created_at: string;
  tweet_url: string;
}

async function scrapeTweets(page: Page): Promise<Tweet[]> {
  const tweets: Tweet[] = [];
  let previousCount = 0;

  while (tweets.length < LIMIT) {
    await page.mouse.wheel(0, 15000);
    await page.waitForTimeout(2000);

    const tweetElements = await page.$$('article[data-testid="tweet"]');
    
    for (let i = previousCount; i < tweetElements.length; i++) {
      const el = tweetElements[i];
      
      const tweetId = await el.getAttribute('data-tweet-id');
      if (!tweetId) continue;

      // 👈 FIXED: Proper typing dengan ElementHandle
      const username = await el.evaluate((element: Element): string => {
        const link = element.querySelector('[data-testid="User-Name"] a') as HTMLAnchorElement | null;
        return link?.textContent?.trim() || '';
      });

      const text = await el.evaluate((element: Element): string => {
        const textEl = element.querySelector('[data-testid="tweetText"]') as HTMLElement | null;
        return textEl?.textContent?.trim() || '';
      });

      const created_at = await el.evaluate((element: Element): string => {
        const timeEl = element.querySelector('time') as HTMLTimeElement | null;
        return timeEl?.getAttribute('datetime') || '';
      });

      const tweet_url = await el.evaluate((element: Element): string => {
        const timeEl = element.querySelector('time') as HTMLTimeElement | null;
        const linkEl = timeEl?.closest('a') as HTMLAnchorElement | null;
        return linkEl ? `https://twitter.com${linkEl.getAttribute('href')}` : '';
      });

      if (tweetId && text && username) {
        tweets.push({
          id: tweetId,
          username,
          text,
          created_at,
          tweet_url
        });

        if (tweets.length >= LIMIT) break;
      }
    }

    previousCount = tweetElements.length;
    if (previousCount === tweets.length) break;
  }

  return tweets;
}

async function main() {
  const pool = await mysql.createPool({
    host: 'localhost', user: 'root', password: 'root', database: 'sentiment_twitter'
  });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  await context.addCookies([{ name: 'auth_token', value: AUTH_TOKEN, domain: '.twitter.com', path: '/' }]);

  try {
    console.log('🚀 Scraping Twitter...');
    await page.goto(`https://twitter.com/search?q=${encodeURIComponent(KEYWORD)}&src=typed_query&f=live`);

    const tweets = await scrapeTweets(page);
    console.log(`📥 Scraped ${tweets.length} tweets`);

    for (const tweet of tweets) {
      await pool.execute(
        `INSERT IGNORE INTO tweets (id, username, text, created_at, tweet_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [tweet.id, tweet.username, tweet.text, tweet.created_at, tweet.tweet_url]
      );
    }

    console.log(`✅ ${tweets.length} tweets → sentiment_twitter.tweets`);
  } catch (error: any) {
    console.error('❌', error.message);
  } finally {
    await browser.close();
    await pool.end();
  }
}

main();
