"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import CustomInputForm from '@/components/FormField'
import { Form } from '@/components/ui/form'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserProfileAndDwolla } from '@/lib/profile.actions'

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  dateofbirth: z.string().min(1, "Date of birth is required"),
  SSN: z.string().min(1, "SSN is required"),
})

type ProfileFormData = z.infer<typeof profileSchema>

const CompleteProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      dateofbirth: "",
      SSN: "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const result = await updateUserProfileAndDwolla(data)
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/') // Redirect to main app
      }
    } catch (err) {
      setError("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We need a few more details to set up your banking features.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomInputForm
              control={form.control}
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
            />
            <CustomInputForm
              control={form.control}
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
            />
            <CustomInputForm
              control={form.control}
              name="address"
              label="Address"
              placeholder="Enter your address"
            />
            <CustomInputForm
              control={form.control}
              name="city"
              label="City"
              placeholder="Enter your city"
            />
            <CustomInputForm
              control={form.control}
              name="state"
              label="State"
              placeholder="Enter your state"
            />
            <CustomInputForm
              control={form.control}
              name="postalCode"
              label="Postal Code"
              placeholder="Enter your postal code"
            />
            <CustomInputForm
              control={form.control}
              name="dateofbirth"
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
            />
            <CustomInputForm
              control={form.control}
              name="SSN"
              label="SSN"
              placeholder="Enter your SSN"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating..." : "Complete Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default CompleteProfile