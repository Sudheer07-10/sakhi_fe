import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("janma-calendar p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-5",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-semibold text-slate-700 tracking-wide",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-full",
          "h-8 w-8 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/60",
          "text-rose-500 hover:from-rose-100 hover:to-pink-100 hover:text-rose-600 hover:border-rose-300",
          "transition-all duration-200 hover:shadow-sm hover:shadow-rose-100",
          "active:scale-95"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full justify-between mb-1",
        head_cell:
          "text-rose-400 font-semibold rounded-md w-8 sm:w-10 text-[0.6rem] sm:text-[0.7rem] text-center uppercase tracking-wider",
        row: "flex w-full justify-between mt-1",
        cell: cn(
          "h-8 w-8 sm:h-10 sm:w-10 text-center text-xs sm:text-sm p-0 relative rounded-full",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "h-8 w-8 sm:h-10 sm:w-10 p-0 font-medium rounded-full inline-flex items-center justify-center text-xs sm:text-sm",
          "text-slate-600 hover:bg-rose-50 hover:text-rose-600",
          "transition-all duration-200 cursor-pointer",
          "focus:outline-none",
          "aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "calendar-heart-selected",
        day_today: "bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 font-bold border border-teal-200/60",
        day_outside:
          "day-outside text-slate-300 aria-selected:bg-rose-50/50 aria-selected:text-rose-300",
        day_disabled: "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent",
        day_range_middle:
          "aria-selected:bg-rose-50 aria-selected:text-rose-600",
        day_hidden: "invisible",
        caption_dropdowns: "flex justify-center gap-2 px-8 sm:px-10",
        dropdown: "",
        dropdown_month: "",
        dropdown_year: "",
        dropdown_icon: "",
        vhidden: "sr-only",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        Dropdown: (props) => {
          const { value, onChange, children, style, className, ...other } = props;
          const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(e);
          };
          return (
            <div className="relative flex items-center mx-0.5">
              <select
                className={cn(
                  "janma-calendar-dropdown",
                  "appearance-none bg-white font-semibold cursor-pointer text-sm",
                  "pr-7 pl-3 py-1.5 rounded-lg",
                  "border border-rose-200/70 shadow-sm",
                  "text-slate-700",
                  "hover:border-rose-300 hover:bg-rose-50/50",
                  "focus:outline-none focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400",
                  "transition-all duration-200",
                  className
                )}
                value={value}
                onChange={handleChange}
                style={style}
                {...other}
              >
                {children}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

