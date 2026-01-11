"use client"

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import CustomInputForm from './FormField'
import { Form } from './ui/form'
import { Loader2 } from 'lucide-react'
import { formSchema } from '@/types/auth.schema'
import { useRouter } from 'next/navigation'
import { SignIn, SignUp } from '@/lib/user.action'
import { getFirebaseErrorMessage } from '@/lib/firebaseError'
import { FirebaseError } from "firebase/app";
import { createSessionFromToken } from "@/lib/session.server";

const AuthForm = ({
    type
}: {
    type: "sign-in" | "sign-up"
}) => {
    const [ user, setUser ] = useState<User | null>(null);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState("")
    const router = useRouter();

    const authFormSchema = formSchema(type);

    const form = useForm<z.infer<typeof authFormSchema>>({
        resolver: zodResolver(authFormSchema),
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            city: "",
            address: "",
            state: "",
            postalCode: "",
            dateofbirth: "",
            SSN: ""
        },
    })

      // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
        // Do something with the form data.
        // ✅ This will be type-safe and validated.
        setIsLoading(true)
        try {
            //sign up with firebase and create a new laid Link
            if (type === "sign-up") {
                const { user, idToken } = await SignUp(data);

                await createSessionFromToken(idToken);

                setUser(user)
            } else if (type === "sign-in") {
                const { idToken } = await SignIn({
                    email: data.email,
                    password: data.password
                });
                await createSessionFromToken(idToken);

                router.push("/")
            }
            // console.log(data)
            setIsLoading(false)
        } catch (error) {
            if (error instanceof FirebaseError) {
                const errorMessage = error?.code && getFirebaseErrorMessage(error.code)
                setError(errorMessage)
            }
            console.error("Internal server error. Please try again later.", error)
            setError("Internal server error. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <section className='flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-10! md:gap-8'>
        <header className="flex flex-col gap-5">
            <Link href="/" className='cursor-pointer items-center gap-1 flex'>
                <Image
                    src="/icons/logo.svg"
                    width={34} height={34}
                    alt="Bevel Banking"
                    className="size-6 max-xl:size-14"
                />
                <h1 className="font-ibm text-26 font-bold text-black-1">
                    Bevel Finance
                </h1>
            </Link>

            <div className="flex flex-col gap-1 md:gap-3">
                <h1 className="text-24 font-semibold -tracking-normal text-gray-900 ">
                    {user ? 'Link Account': type === "sign-in" ? 'Sign In' : 'Sign Up' }
                    <p className="text-16 font-normal text-gray-600">
                        {user ? 'Link your account to get started' : 'Please enter your details'}
                    </p>
                </h1>
            </div>
        </header>

        {user ? (
            <div className="flex flex-col gap-4">
                {/* <PlaidLink /> */}
            </div>
        ): (
            <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="gap-5!">
                    {type === "sign-up" && (
                        <>
                            <div className="flex md:gap-2 flex-col md:flex-row">
                                <CustomInputForm
                                    form={form}
                                    name="firstName"
                                    label="First Name"
                                    placeholder="e.g. John"
                                    required={false}
                                />
                                <CustomInputForm
                                    form={form}
                                    name="lastName"
                                    label="Last Name"
                                    placeholder="e.g. Doe"
                                    required={false}
                                />
                            </div>
                            <CustomInputForm
                                form={form}
                                name="city"
                                label="City"
                                placeholder="Enter your specific city"
                                required={false}
                            />
                            <CustomInputForm
                                form={form}
                                name="address"
                                label="Address"
                                placeholder="Enter your specific address"
                                required={false}
                            />
                            <div className="flex md:gap-2 flex-col md:flex-row">
                                <CustomInputForm
                                    form={form}
                                    name="state"
                                    label="State"
                                    placeholder="e.g. NY"
                                    required={false}
                                />
                                <CustomInputForm
                                    form={form}
                                    name="postalCode"
                                    label="Postal code"
                                    placeholder="e.g. 901101"
                                    required={false}
                                />
                            </div>
                            <div className="flex md:gap-2 flex-col md:flex-row">
                                <CustomInputForm
                                    form={form}
                                    name="dateofbirth"
                                    label="Date of Birth"
                                    placeholder="yyyy-mm-dd"
                                    required={false}
                                />
                                <CustomInputForm
                                    form={form}
                                    name="SSN"
                                    label="SSN"
                                    placeholder="e.g. 1234"
                                    required={false}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <CustomInputForm
                            form={form}
                            name="email"
                            label="Email"
                            placeholder="Enter your email"
                            required={true}
                        />
                        <CustomInputForm
                            form={form}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            required={true}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button type="submit" className="px-2! text-16 rounded-lg border border-bank-gradient bg-bank-gradient font-semibold text-white shadow-form">
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin"/> &nbsp; Loading...
                                </>
                            ): type === "sign-in" ? "Sign In" : "Sign Up"}
                        </Button>
                        
                        <footer className="flex flex-col justify-center gap-1">
                            {
                                error && (
                                    <p className="font-mono text-[10px] flex items-center justify-center text-red-600">{error}</p>
                                )
                            }
                            <p className="text-14 font-normal text-gray-600">
                                {
                                    type === "sign-in" ? "Don't have an account?" : "Already have an account?"
                                }&nbsp;
                                <Link href={type==="sign-in" ? "/sign-up" : "/sign-in"} className="text-bank-gradient text-14 cursor-pointer font-medium">
                                    {
                                        type === "sign-in" ? "Sign up" : "sign in"
                                    }
                                </Link>
                            </p>
                        </footer>
                    </div>
                  </form>
                </Form>
            </>
        )}
    </section>
  )
}

export default AuthForm