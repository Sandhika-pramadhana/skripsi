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
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/features/core/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role, User } from "@/types/def";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import SelectInput from "react-select";
import useSWR, { useSWRConfig } from "swr";
import { useToast } from "@/features/core/hooks/use-toast";
import { createUser, updateUser } from "@/actions/master/user/user";
import { getRoles } from "@/actions/master/role/role";
import { useDebounce } from "@uidotdev/usehooks";
import { unwrap } from "@/actions/use-action";
import { Eye, EyeOff } from "lucide-react";

interface FormUserProps {
    open: boolean;
    onOpenModal: (open: boolean) => void;
    data?: User;
    isEdit?: boolean;
}

const formSchema = z.object({
    name: z.string().min(1, { message: "Name harus diisi" }),
    username: z.string().min(1, { message: "Username harus diisi" }),
    password: z.string().min(1, { message: "Password harus diisi" }),
    role: z.object({
        roleId: z.string(),
        roleName: z.string(),
    }),
  });

const FormUser: React.FC<FormUserProps> = ({
    open,
    onOpenModal,
    data,
    isEdit,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const { mutate } = useSWRConfig();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { toast } = useToast();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: data ? { 
            name: data.name, 
            username: data.username, 
            password: data.password,
            role : {
                roleId: data.roleId,
                roleName: data.roleName
            }
        } : { 
            name: "", 
            username: "", 
            password: "",
            role : {
                roleId : "",
                roleName: ""
            }
        },
    });

    const [searchRole, setSearchRole] = useState("");
    const searchRoleDebounce = useDebounce(searchRole, 500);

    const { data: roleOptionsSWR, isLoading: roleOptionsLoading } = useSWR(
        `roleOptions-${searchRoleDebounce}`,
        () => unwrap(getRoles())
      );
      const roleOptions = useMemo(
        () => roleOptionsSWR?.map((role) => ({ label: role.roleName, value: role.roleId })) || [],
        [roleOptionsSWR]
      );
    
    const onCloseForm = useCallback(() => {
        form.reset();
        onOpenModal(false);
    }, [form, onOpenModal]);

    const onSubmit = useCallback(async (values : any) => {
        setIsSubmitting(true);
        const { role, ...otherValues } = values;
        const payload = {
            ...otherValues,
            roleId: role.roleId,
            roleName: role.roleName
        };
        const res = isEdit && data?.id ? await updateUser({ ...payload, id: data.id }) : await createUser(payload);
    
        if (res.success) {
            toast({
                title: "Berhasil",
                description: `User berhasil ${isEdit ? "diupdate" : "dibuat"}.`,
            });
            mutate((key) => typeof key === "string" && key.startsWith(`userManage-`));
            onCloseForm();
        } else {
            toast({
                title: "Gagal",
                description: res.message || `Gagal ${isEdit ? "update" : "buat"} user.`,
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
    }, [isEdit, data, mutate, onCloseForm]);
    
      useEffect(() => {
        if (isEdit && open) {
          form.reset({ name: data?.name, username: data?.username, password: data?.password});
        }
      }, [data, isEdit, form, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenModal}>
            <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Update User" : "Tambah User"}</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...form}>
                        <div className="mt-1 px-1">
                            <form id="form-user" onSubmit={form.handleSubmit(onSubmit)}>
                                {/* Nama Lengkpa */}
                                <Controller
                                    control={form.control}
                                    name="name"
                                    render={({ field, fieldState }) => (
                                    <FormItem className="grid grid-cols-4 gap-2 items-center">
                                        <FormLabel className="col-span-1 text-left">Nama</FormLabel>
                                        <FormControl>
                                            <input {...field} placeholder="Isi nama lengkap" className="text-[12px] col-span-3 border rounded-sm p-2 w-full"/>
                                        </FormControl>
                                        {fieldState.error && (
                                            <FormMessage className="-mt-[0.875rem] min-h-[0.875rem] font-light leading-none">{fieldState.error.message}</FormMessage>
                                        )}
                                    </FormItem>
                                    )}
                                />

                                {/* Username */}
                                <Controller
                                    control={form.control}
                                    name="username"
                                    render={({ field, fieldState }) => (
                                    <FormItem className="grid grid-cols-4 gap-2 items-center">
                                        <FormLabel className="col-span-1 text-left">Username</FormLabel>
                                        <FormControl>
                                        <input {...field} placeholder="Isi username" className="text-[12px] col-span-3 border rounded-sm p-2 w-full"/>
                                        </FormControl>
                                        {fieldState.error && (
                                            <FormMessage className="-mt-[0.875rem] min-h-[0.875rem] font-light leading-none">{fieldState.error.message}</FormMessage>
                                        )}
                                    </FormItem>
                                    )}
                                />

                                {/* Password} */}
                                <Controller
                                    control={form.control}
                                    name="password"
                                    render={({ field, fieldState }) => (
                                    <FormItem className="grid grid-cols-4 gap-2 items-center">
                                        <FormLabel className="col-span-1 text-left">Password</FormLabel>
                                        <FormControl>
                                        <div className="relative w-[272px]">
                                            <input {...field} placeholder="Isi password" type={showPassword ? "text" : "password"} className="text-[12px] col-span-3 border rounded-sm p-2 w-full"/>
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 focus:outline-none"
                                                >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        </FormControl>
                                        {fieldState.error && (
                                            <FormMessage className="-mt-[0.875rem] min-h-[0.875rem] font-light leading-none">{fieldState.error.message}</FormMessage>
                                        )}
                                    </FormItem>
                                    )}
                                />
                                {/* Role Selection */}
                                <Controller
                                    control={form.control}
                                    name="role"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="grid grid-cols-4 gap-2 items-center">
                                            <FormLabel className="col-span-1 text-left">Role</FormLabel>
                                            <FormControl>
                                                <SelectInput
                                                    placeholder="Pilih Role"
                                                    options={roleOptions}
                                                    onInputChange={(value) => setSearchRole(value)}
                                                    onChange={(selected) => {
                                                        form.setValue('role.roleId', selected ? selected.value : '');
                                                        form.setValue('role.roleName', selected ? selected.label : '');
                                                    }}
                                                    isLoading={roleOptionsLoading}
                                                    noOptionsMessage={() => "Tidak ada data"}
                                                    isClearable
                                                    className="text-sm w-[272px]"
                                                    menuPosition="fixed"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        menuPortal: (base) => ({
                                                            ...base,
                                                            zIndex: 9999,
                                                            pointerEvents: "auto"
                                                        }),
                                                    }}
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
                                form="form-user"
                                >
                                {isEdit ? "Update" : "Tambah"}
                            </Button>
                        </DialogFooter>
                    </FormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default FormUser;
