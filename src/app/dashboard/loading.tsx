/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex flex-col gap-8 animate-pulse p-4">
            <div className="flex items-center justify-between pb-8">
                <div className="space-y-3">
                    <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                    <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                </div>
                <div className="h-12 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
                <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
                <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
            </div>

            <div className="h-96 bg-zinc-100 dark:bg-zinc-900 rounded-3xl mt-4" />
        </div>
    )
}
