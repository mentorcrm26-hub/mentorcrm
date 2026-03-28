/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { getTags } from './actions'
import { TagsClient } from './tags-client'

export const metadata = {
    title: 'Visual Tags | Mentor CRM',
}

export default async function TagsPage() {
    const { tags } = await getTags()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Visual Tags
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Create custom colorful tags to visually organize and filter your leads on the Kanban board.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/10 p-6">
                <TagsClient initialTags={tags || []} />
            </div>
        </div>
    )
}
