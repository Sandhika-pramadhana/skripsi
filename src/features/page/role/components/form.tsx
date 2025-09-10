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
import { Role } from "@/types/def";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { useToast } from "@/features/core/hooks/use-toast";
import { createRole, updateRole } from "@/actions/master/role/role";

interface FormRoleProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: Role;
  isEdit?: boolean;
}

const formSchema = z.object({
  roleName: z.string().min(1, { message: "Nama harus diisi" }),
});

const FormRole: React.FC<FormRoleProps> = ({
  open,
  onOpenModal,
  data,
  isEdit,
}) => {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data
      ? { roleName: data.roleName }
      : { roleName: "" },
  });

  const onCloseForm = useCallback(() => {
    form.reset();
    onOpenModal(false);
  }, [form, onOpenModal]);

  const onSubmit = useCallback(async (values: any) => {
    setIsSubmitting(true);
    const res = isEdit && data?.id
  ? await updateRole(data.id, values.roleName) 
  : await createRole(values.roleName); 

    if (res.success) {
      toast({
        title: "Berhasil",
        description: `Role berhasil ${isEdit ? "diupdate" : "dibuat"}.`,
      });

      mutate((key) => typeof key === "string" && key.startsWith(`roleManage-`));
      onCloseForm();
    } else {
      toast({
        title: "Gagal",
        description: res.message || `Gagal ${isEdit ? "update" : "buat"} role.`,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  }, [isEdit, data?.id, toast, mutate, onCloseForm]);

  useEffect(() => {
    if (isEdit && open) {
      form.reset({ roleName: data?.roleName || "" });
    }
  }, [data, isEdit, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Role" : "Tambah Role"}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <div className="mt-1 px-1">
            <form id="form-role" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Nama Role */}
              <Controller
                control={form.control}
                name="roleName"
                render={({ field, fieldState }) => (
                  <FormItem className="grid grid-cols-4 gap-2 items-center">
                    <FormLabel className="col-span-1 text-left">Nama Role</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="Isi nama role"
                        className="text-[12px] col-span-3 border rounded-sm p-2 w-full"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </div>
        </FormProvider>
        <DialogFooter className="py-1 mt-4">
          <Button variant="outline" onClick={onCloseForm}>Tutup</Button>
          <Button
            variant="outline"
            className="bg-[#003366] text-white hover:bg-[#295887] hover:text-white"
            disabled={isSubmitting}
            type="submit"
            form="form-role"
          >
            {isEdit ? "Update" : "Tambah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormRole;
