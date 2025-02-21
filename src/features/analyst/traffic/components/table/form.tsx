/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import { Button } from "@/features/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/core/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/features/core/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrafficReportMyTsel } from "@/types/def";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { useToast } from "@/features/core/hooks/use-toast";
import { createTraffic } from "@/actions/mytsel/traffic/traffic";

interface FormTrafficProps {
    open: boolean;
    onOpenModal: (open: boolean) => void;
    data?: TrafficReportMyTsel;
}

const formSchema = z.object({
    date: z.string().min(1, { message: "Tanggal harus diisi" }),
    activeUser: z.number().min(1, { message: "Jumlah pengguna aktif harus diisi" }),
    viewCount: z.number().min(1, { message: "Jumlah traffic harus diisi" }),
  });

const FormTraffic: React.FC<FormTrafficProps> = ({
    open,
    onOpenModal,
    data,
}) => {
    const { mutate } = useSWRConfig();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: data ? { 
            date: data.date,
            activeUser: data.activeUser,
            viewCount: data.viewCount
        } : { 
            date: "", 
            activeUser: 0, 
            viewCount: 0,
        },
    });
   
    const onCloseForm = useCallback(() => {
        form.reset();
        onOpenModal(false);
    }, [form, onOpenModal]);

    const onSubmit = useCallback(async (values : TrafficReportMyTsel) => {
        setIsSubmitting(true);
        const requestBody = {
            date: values.date,
            activeUser: values.activeUser,
            viewCount: values.viewCount
          };
      
        const res = await createTraffic(requestBody);
    
        if (res.success) {
            toast({
                title: "Berhasil",
                description: "Data traffic berhasil dibuat.",
            });
            mutate((key) => typeof key === "string" && key.startsWith(`trafficManage-`));
            onCloseForm();
        } else {
            toast({
                title: "Gagal",
                description: res.message || "Gagal buat data traffic.",
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
    }, [toast, mutate, onCloseForm]);

    return (
        <Dialog open={open} onOpenChange={onOpenModal}>
            <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Data Traffic</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...form}>
                        <div className="mt-1 px-1">
                            <form id="form-traffic" onSubmit={form.handleSubmit(onSubmit)}>
                                {/* Tanggal */}
                                <Controller
                                    control={form.control}
                                    name="date"
                                    render={({ field, fieldState }) => (
                                    <FormItem className="grid grid-cols-4 gap-2 items-center">
                                        <FormLabel className="col-span-1 text-left">Tanggal</FormLabel>
                                        <FormControl>
                                            <input {...field} type="date" className="text-[12px] col-span-3 border rounded-sm p-2 w-full"/>
                                        </FormControl>
                                        {fieldState.error && (
                                            <FormMessage className="-mt-[0.875rem] min-h-[0.875rem] font-light leading-none">{fieldState.error.message}</FormMessage>
                                        )}
                                    </FormItem>
                                    )}
                                />

                                {/* Pengguna Aktif */}
                                <Controller
                                    control={form.control}
                                    name="activeUser"
                                    render={({ field, fieldState }) => (
                                    <FormItem className="grid grid-cols-4 gap-2 items-center">
                                        <FormLabel className="col-span-1 text-left">Pengguna Aktif</FormLabel>
                                        <FormControl>
                                        <input {...field} type="number" className="text-[12px] col-span-3 border rounded-sm p-2 w-full"
                                            onChange={(e) => {field.onChange(parseInt(e.target.value, 10));}}
                                        />
                                        </FormControl>
                                        {fieldState.error && (
                                            <FormMessage className="-mt-[0.875rem] min-h-[0.875rem] font-light leading-none">{fieldState.error.message}</FormMessage>
                                        )}
                                    </FormItem>
                                    )}
                                />

                                {/* Traffic */}
                                <Controller
                                    control={form.control}
                                    name="viewCount"
                                    render={({ field, fieldState }) => (
                                    <FormItem className="grid grid-cols-4 gap-2 items-center">
                                        <FormLabel className="col-span-1 text-left">Jumlah Traffic</FormLabel>
                                        <FormControl>
                                        <input {...field} type="number" className="text-[12px] col-span-3 border rounded-sm p-2 w-full" 
                                            onChange={(e) => {field.onChange(parseInt(e.target.value, 10));}}
                                        />
                                        </FormControl>
                                        {fieldState.error && (
                                            <FormMessage className="-mt-[0.875rem] min-h-[0.875rem] font-light leading-none">{fieldState.error.message}</FormMessage>
                                        )}
                                    </FormItem>
                                    )}
                                />
                            </form>
                        </div>
                        <DialogFooter className="py-1 mt-4">
                            <Button variant="outline" onClick={onCloseForm}>Tutup</Button>
                            <Button
                                variant="outline"
                                className="bg-[#003366] text-white hover:bg-[#295887] hover:text-white"
                                disabled={isSubmitting}
                                type="submit"
                                form="form-traffic"
                                >
                                Tambah
                            </Button>
                        </DialogFooter>
                    </FormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default FormTraffic;
