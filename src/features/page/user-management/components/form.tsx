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
import { User } from "@/types/def";
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

// Define types for better type safety
interface RoleOption {
  label: string;
  value: string;
}

interface FormUserProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: User;
  isEdit?: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Nama harus diisi" }),
  username: z.string().min(1, { message: "Username harus diisi" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
  role: z.object({
    roleId: z.string().min(1, { message: "Role harus dipilih" }),
    roleName: z.string().min(1, { message: "Role harus dipilih" }),
  }),
});

// Mapping role string ke ID
const roleMapping: Record<string, number> = {
  superadmin: 1,
  operational: 2,
  accounting: 3,
};

const FormUser: React.FC<FormUserProps> = ({ open, onOpenModal, data, isEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || "",
      username: data?.username || "",
      password: "",
      role: {
        roleId: data?.role_id ? String(data.role_id) : "",
        roleName: data?.roleName || "",
      },
    },
  });

  const [searchRole, setSearchRole] = useState("");
  const searchRoleDebounce = useDebounce(searchRole, 500);

  const { data: roleOptionsSWR, isLoading: roleOptionsLoading } = useSWR(
    `roleOptions-${searchRoleDebounce}`,
    () => unwrap(getRoles())
  );

  // Static role options - sesuai dengan mapping
  const roleOptions = useMemo((): RoleOption[] => {
    return [
      { label: "Superadmin", value: "1" },
    ];
  }, []);

  const onCloseForm = useCallback(() => {
    form.reset();
    setShowPassword(false);
    onOpenModal(false);
  }, [form, onOpenModal]);

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const { role, ...otherValues } = values;

    // Convert role string ke integer
    const roleIdInt = parseInt(role.roleId) || 0;

    const payload: any = {
      ...otherValues,
      role_id: roleIdInt,
      roleName: role.roleName,
    };

    const res = isEdit && data?.id
      ? await updateUser({ ...payload, id: data.id })
      : await createUser(payload);

    if (res.success) {
      toast({
        title: "Berhasil",
        description: `User ${isEdit ? "berhasil diupdate" : "berhasil ditambahkan"}.`,
      });
      // Mutate both user and role cache
      mutate((key) => typeof key === "string" && (
        key.startsWith("userManage-") || 
        key.startsWith("roleManage-")
      ));
      onCloseForm();
    } else {
      toast({
        title: "Gagal",
        description: res.message || `Gagal ${isEdit ? "update" : "menambahkan"} user.`,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }, [isEdit, data?.id, toast, mutate, onCloseForm]);

  useEffect(() => {
    if (isEdit && open && data) {
      form.reset({
        name: data.name,
        username: data.username,
        password: "",
        role: {
          roleId: data.role_id ? String(data.role_id) : "",
          roleName: data.roleName || "",
        },
      });
    } else if (!isEdit && open) {
      form.reset({
        name: "",
        username: "",
        password: "",
        role: {
          roleId: "",
          roleName: "",
        },
      });
    }
  }, [data, open, isEdit, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update User" : "Tambah User"}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <div className="mt-1 px-1">
            <form id="form-user" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Nama */}
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="grid grid-cols-4 gap-2 items-center">
                    <FormLabel className="col-span-1 text-left">Nama</FormLabel>
                    <div className="col-span-3 space-y-1">
                      <FormControl>
                        <input 
                          {...field} 
                          placeholder="Isi nama lengkap" 
                          className="text-[12px] border rounded-sm p-2 w-full"
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage className="text-xs">{fieldState.error.message}</FormMessage>
                      )}
                    </div>
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
                    <div className="col-span-3 space-y-1">
                      <FormControl>
                        <input 
                          {...field} 
                          placeholder="Isi username" 
                          className="text-[12px] border rounded-sm p-2 w-full"
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage className="text-xs">{fieldState.error.message}</FormMessage>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              {/* Password */}
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="grid grid-cols-4 gap-2 items-center">
                    <FormLabel className="col-span-1 text-left">Password</FormLabel>
                    <div className="col-span-3 space-y-1">
                      <FormControl>
                        <div className="relative">
                          <input 
                            {...field} 
                            placeholder={isEdit ? "masukkan password" : "Isi password"} 
                            type={showPassword ? "text" : "password"} 
                            className="text-[12px] border rounded-sm p-2 w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage className="text-xs">{fieldState.error.message}</FormMessage>
                      )}
                    </div>
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
                    <div className="col-span-3 space-y-1">
                      <FormControl>
                        <SelectInput
                          placeholder="Pilih Role"
                          options={roleOptions}
                          value={roleOptions.find((option: RoleOption) => option.value === field.value?.roleId) || null}
                          onInputChange={(value) => setSearchRole(value)}
                          onChange={(selected) => {
                            field.onChange(selected ? {
                              roleId: selected.value,
                              roleName: selected.label
                            } : { roleId: '', roleName: '' });
                          }}
                          isLoading={roleOptionsLoading}
                          noOptionsMessage={() => "Tidak ada data"}
                          isClearable
                          className="text-sm"
                          menuPosition="fixed"
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                              pointerEvents: "auto"
                            }),
                            control: (base) => ({
                              ...base,
                              fontSize: '12px',
                            }),
                          }}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage className="text-xs">{fieldState.error.message}</FormMessage>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </div>
          <DialogFooter className="py-1 mt-4">
            <Button variant="outline" onClick={onCloseForm} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              className="bg-[#003366] text-white hover:bg-[#295887]"
              disabled={isSubmitting}
              type="submit"
              form="form-user"
            >
              {isSubmitting ? "Menyimpan..." : (isEdit ? "Update" : "Tambah")}
            </Button>
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default FormUser;