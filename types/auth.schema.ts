import { z } from "zod"

export const formSchema = (type: "sign-in" | "sign-up") => z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    city: type === "sign-in" ? z.string().optional() : z.string().min(2),  // optional field, add .optional()
    address: type === "sign-in" ? z.string().optional() : z.string().max(50),  // optional field, add .optional()
    firstName: type === "sign-in" ? z.string().optional() : z.string().min(3, { message: "First name required" }),
    lastName: type === "sign-in" ? z.string().optional() : z.string().min(2, { message: "Last name required" }),
    state: type === "sign-in" ? z.string().optional() : z.string().min(2, { message: "State must be at least 6 characters" }).max(4, {message: "state must be at least 6 characters"}),
    postalCode: type === "sign-in" ? z.string().optional() : z.string().min(3, { message: "please input your postal code" }),
    dateofbirth: type === "sign-in" ? z.string().optional() : z.string().min(3, { message: "Date of birth required" }),
    SSN: type === "sign-in" ? z.string().optional() : z.string().min(3, { message: "Please input your SSN" }),
})