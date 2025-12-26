"use client"

import { FieldPath, UseFormReturn } from "react-hook-form";
import { z } from "zod"
import {
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { formSchema } from "@/types/auth.schema";
// import { formSchema } from './AuthForm'

const authFormSchema = formSchema("sign-up")

interface CustomInputProp {
    form: UseFormReturn<z.infer<typeof authFormSchema>>,
    name: FieldPath<z.infer<typeof authFormSchema>>,
    label: string,
    placeholder: string,
    required: boolean
}

const CustomInputForm = ({
    form,
    name,
    label,
    placeholder,
    required
}: CustomInputProp) => {
  return (
            <FormField
              control={form.control}
              name={name}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5 mb-3! w-full">
                    <div className="flex flex-row justify-between">
                        <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700 Uppercase">
                            {label}
                        </FormLabel>
                        {required && (
                            <FormDescription className="flex text-[9px] font-gray-600 font-mono">
                                Required.
                            </FormDescription>
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <FormControl>
                            <Input
                                placeholder={placeholder}
                                className='text-16 placeholder:text-16 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 pl-3!'
                                type={name === 'password' ? 'password' : 'text'}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage className="text-12 text-red-500 mt-2!"/>
                    </div>
                </div>
              )}
            />
  )
}

export default CustomInputForm