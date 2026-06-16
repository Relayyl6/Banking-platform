import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const PaymentForm = ({
  control,
  title,
  placeholder,
  description,
  name,
  children,
  className,
}: {
  control: any;
  title: string;
  placeholder?: string;
  description?: string;
  name: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`border-y border-gray-200v ${className}`}>
          <div className="flex w-full max-w-[850px] flex-col gap-3 md:flex-row lg:gap-8 py-5!">
            {description ? (
              <div className="flex w-full max-w-[280px] flex-col gap-2">
                <FormLabel className="text-14 font-medium text-gray-700">
                  {title}
                </FormLabel>
                <FormDescription className="text-12 font-normal text-gray-600">
                  {description}
                </FormDescription>
              </div>
            ) : (
              <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                {title}
              </FormLabel>
            )}
            
            <div className="flex w-full flex-col">
              {children ? (
                children
              ) : name === "name" ? (
                <FormControl>
                  <Textarea
                    placeholder={title}
                    className="text-16 p-3! placeholder:text-16 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500"
                    {...field}
                  />
                </FormControl>
              ) : (
                <FormControl>
                  <Input
                    placeholder={placeholder}
                    className="text-16 p-3! placeholder:text-16 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500"
                    {...field}
                  />
                </FormControl>
              )}
              <FormMessage className="text-12 text-red-500" />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
};

export default PaymentForm;