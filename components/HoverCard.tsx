import { CalendarIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function HoverCardDemo({
    button
}: {
    button: string
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
            <span className='text-5xl font-bold text-neutral-900'>
              {button}
            </span></Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-60 p-3!">
        <div className="flex justify-between gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The user currently logged in, additional info that can be dsplayed as he/she hover the dp
            </p>
            <div className="text-muted-foreground text-xs">
              Joined December 2021
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
