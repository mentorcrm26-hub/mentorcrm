import { getTeamMembersAction } from './actions'
import { TeamClient } from './team-client'

export const metadata = {
    title: 'My Team | Mentor CRM'
}

export default async function TeamPage() {
    const members = await getTeamMembersAction()
    
    return <TeamClient initialMembers={members} />
}
