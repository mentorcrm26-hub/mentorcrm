/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { getDrawings } from './actions'
import { DrawLibrary } from '@/components/draw/draw-library'

export const dynamic = 'force-dynamic'

export default async function DrawPage() {
    const { data: drawings } = await getDrawings()

    return <DrawLibrary initialDrawings={drawings || []} />
}
