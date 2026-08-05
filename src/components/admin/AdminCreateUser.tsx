"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRoleService, type Role } from "@/services/roleService";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/shared/Spinner";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().optional(),
  isSuperAdmin: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminCreateUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AdminCreateUser = ({
  open,
  onOpenChange,
  onSuccess,
}: AdminCreateUserProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      roleId: "",
      isSuperAdmin: false,
    },
  });

  const { createAdminUser, getRoles } = useRoleService();
  const { toast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) loadRoles();
  }, [open]);

  const loadRoles = async () => {
    setLoadingRoles(true);
    const rolesData = await getRoles();
    if (rolesData) setRoles(rolesData);
    setLoadingRoles(false);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const result = await createAdminUser(
        values.fullName,
        values.email,
        values.password,
        values.roleId || undefined,
        values.isSuperAdmin,
      );

      if (result) {
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Admin User</DialogTitle>
          <DialogDescription>
            Create a new admin user with role and permissions
          </DialogDescription>
        </DialogHeader>

        {/* 🔴 FIX IS HERE */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      {...field}
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSuperAdmin"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel>Super Admin</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Super Admin has all permissions
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {!form.watch("isSuperAdmin") && (
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingRoles}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Spinner className="mr-2 h-4 w-4 animate-spin"  />
                )}
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useRoleService, type Role } from "@/services/roleService";
// import { useToast } from "@/hooks/use-toast";

// const formSchema = z.object({
//   fullName: z.string().min(2, "Full name must be at least 2 characters"),
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   roleId: z.string().optional(),
//   isSuperAdmin: z.boolean().default(false),
// });

// type FormValues = z.infer<typeof formSchema>;

// interface AdminCreateUserProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSuccess?: () => void;
// }

// export const AdminCreateUser = ({
//   open,
//   onOpenChange,
//   onSuccess,
// }: AdminCreateUserProps) => {
//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       fullName: "",
//       email: "",
//       password: "",
//       roleId: "",
//       isSuperAdmin: false,
//     },
//   });

//   const { createAdminUser } = useRoleService();
//   const { toast } = useToast();
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [loadingRoles, setLoadingRoles] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const { getRoles } = useRoleService();

//   useEffect(() => {
//     if (open) {
//       loadRoles();
//     }
//   }, [open]);

//   const loadRoles = async () => {
//     setLoadingRoles(true);
//     const rolesData = await getRoles();
//     if (rolesData) {
//       setRoles(rolesData);
//     }
//     setLoadingRoles(false);
//   };

//   const onSubmit = async (values: FormValues) => {
//     try {
//       setSubmitting(true);
//       const result = await createAdminUser(
//         values.fullName,
//         values.email,
//         values.password,
//         values.roleId || undefined,
//         values.isSuperAdmin,
//       );

//       if (result) {
//         form.reset();
//         onOpenChange(false);
//         onSuccess?.();
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Create Admin User</DialogTitle>
//           <DialogDescription>
//             Create a new admin user with role and permissions
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="fullName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Full Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="John Doe" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="admin@example.com"
//                     type="email"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="password"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Password</FormLabel>
//                 <FormControl>
//                   <Input placeholder="••••••••" type="password" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="isSuperAdmin"
//             render={({ field }) => (
//               <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
//                 <FormControl>
//                   <Checkbox
//                     checked={field.value}
//                     onCheckedChange={field.onChange}
//                   />
//                 </FormControl>
//                 <div className="space-y-1 leading-none">
//                   <FormLabel>Super Admin</FormLabel>
//                   <p className="text-sm text-muted-foreground">
//                     Super Admin has all permissions
//                   </p>
//                 </div>
//               </FormItem>
//             )}
//           />

//           {!form.watch("isSuperAdmin") && (
//             <FormField
//               control={form.control}
//               name="roleId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Role</FormLabel>
//                   <Select
//                     value={field.value}
//                     onValueChange={field.onChange}
//                     disabled={loadingRoles}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a role" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {roles.map((role) => (
//                         <SelectItem key={role.id} value={role.id}>
//                           {role.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           )}

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={submitting}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={submitting}>
//               {submitting && <Spinner className="mr-2 h-4 w-4 animate-spin"  />}
//               Create Admin
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };
