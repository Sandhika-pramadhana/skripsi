/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/features/core/components/ui/form';
import { Button } from '@/features/core/components/ui/button';
import { User2Icon, LockKeyholeIcon, EyeOff, Eye } from 'lucide-react';
import { Input } from '@/features/core/components/ui/input';
import { LoginUser } from '@/actions/auth/auth';
import { useToast } from '@/features/core/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

type FormSchema = z.infer<typeof formSchema>;

const LoginForm = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
      if (loginSuccess) {
          router.push('/dashboard');
      }
  }, [loginSuccess, router]);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
          password: "",
        },
    });

    const onSubmit = async (data: FormSchema) => {
      try {
          const response = await LoginUser(data);
          if (response.success) {
              toast({
                  title: "Berhasil",
                  description: "Login berhasil!",
              });
              setLoginSuccess(true);
          } else {
              toast({
                  variant: "destructive",
                  title: "Gagal",
                  description: "Login gagal, silahkan cek username dan password anda.",
              });
          }
      } catch (error) {
          toast({
              variant: "destructive",
              title: "Error",
              description: "Terjadi kesalahan saat proses login.",
          });
      }
  };
      
    return (
    <>
      <div className="flex flex-col items-center md:items-start gap-5 p-4">
        <Image
            src="/asset/logo/logo_posfin.png"
            alt="Logo-pos.png"
            width={120}
            height={120}
            priority
          />
        <h1 className="text-2xl text-start">
          Selamat Datang <br />
          Di <span className="font-bold text-[#003366]">Dashboard Monitoring Internal</span>
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 w-full"
          >
            <div className="flex flex-col gap-1">
              <p className="font-bold text-2xl">Silakan Masuk</p>
            </div>
            <div className="w-full space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-base">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="rounded-1 pl-9"
                          placeholder="Masukan Username"
                        />
                        <User2Icon size={20} className="absolute -translate-y-1/2 top-1/2 left-0 ml-2 flex self-center items-center text-gray-500 focus:outline-none"/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-base">Kata Sandi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="rounded-1 pl-9 pr-10"
                          placeholder="Masukan kata sandi"
                        />
                        <LockKeyholeIcon size={20} className="absolute -translate-y-1/2 top-1/2 left-0 ml-2 flex self-center items-center text-gray-500 focus:outline-none"/>
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full mt-8 rounded-full text-sm font-black bg-[#F48120] hover:bg-[#fdb376]"
              >
                Masuk
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
    );
};

export default LoginForm;
