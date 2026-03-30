import os

def update_demo_kanban():
    filepath = 'src/components/demo/demo-kanban.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    old_cols = """const COLUMNS = [
    { id: 'Diagnostic', title: 'Diagnóstico', color: 'bg-blue-500' },
    { id: 'Interview', title: 'Entrevista', color: 'bg-yellow-500' },
    { id: 'Strategy', title: 'Estratégia', color: 'bg-purple-500' },
    { id: 'Presentation', title: 'Apresentação', color: 'bg-indigo-500' },
    { id: 'Active Protection', title: 'Proteção Ativada', color: 'bg-emerald-500' },
]"""

    new_cols = """const COLUMNS = [
    { id: 'New Lead', title: 'New Lead', color: 'bg-blue-500' },
    { id: 'Attempting Contact', title: 'Attempting Contact', color: 'bg-yellow-400' },
    { id: 'In Conversation', title: 'In Conversation', color: 'bg-emerald-400' },
    { id: 'Scheduled', title: 'Scheduled', color: 'bg-purple-500' },
    { id: 'Proposal/Analysis', title: 'Proposal/Analysis', color: 'bg-orange-500' },
    { id: 'Won', title: 'Won', color: 'bg-emerald-600' },
    { id: 'Lost', title: 'Lost', color: 'bg-red-500' },
]"""

    if old_cols in content:
        content = content.replace(old_cols, new_cols)
    else:
        # try line by line matching or normalized spaces
        print('kanban: Could not find exact old_cols string, replacing manually.')
        import re
        content = re.sub(r'const COLUMNS = \[.*?\]', new_cols, content, flags=re.DOTALL)
        
    content = content.replace("'Diagnostic'", "'New Lead'")
    content = content.replace("'Diagnóstico Pendente'", "'New Lead'")
    content = content.replace("'Strategy'", "'Scheduled'")
    content = content.replace("'Estratégia Pronta'", "'Scheduled Meeting'")
    content = content.replace("'Active Protection'", "'Won'")
    content = content.replace("'Proteção Ativada'", "'Won'")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def update_layout():
    filepath = 'src/app/demo/layout.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Imports
    content = content.replace(
        "import { LayoutDashboard, Users, LogIn } from 'lucide-react'", 
        "import { LayoutDashboard, Users, LogIn, LogOut, Home } from 'lucide-react'"
    )

    # Sidebar links
    if 'Home' not in content:
        import re
        content = re.sub(
            r'(<div className="flex-1 py-6 px-4 space-y-2 relative">)',
            r'\1\n                        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">\n                            <Home className="w-5 h-5" />\n                            Home\n                        </Link>',
            content
        )

    # Sidebar Logout
    if 'action="/auth/signout"' not in content:
        import re
        content = re.sub(
            r'(<Link href="/signup".*?</Link>)',
            r'\1\n                        <form action="/auth/signout" method="post">\n                            <button type="submit" className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors justify-center transition-all">\n                                <LogOut className="w-4 h-4" />\n                                Logout\n                            </button>\n                        </form>',
            content,
            count=1 # only the first one which is inside the sidebar
        )
    
    # Mobile header logout
    if 'action="/auth/signout"' in content and content.count('action="/auth/signout"') == 1:
        import re
        content = re.sub(
            r'(<Link href="/signup" className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 flex items-center gap-2">\s*Create Account\s*</Link>)',
            r'''<div className="flex items-center gap-2">
                             <Link href="/" className="px-3 py-1.5 rounded text-xs font-semibold text-zinc-700 bg-zinc-100 flex items-center gap-2">
                                <Home className="w-3 h-3" />
                                Home
                             </Link>
                            <form action="/auth/signout" method="post">
                                <button type="submit" className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-zinc-800 flex items-center gap-2" title="Logout">
                                    <LogOut className="w-3 h-3" />
                                </button>
                            </form>
                        </div>''',
            content
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def update_leads_page():
    filepath = 'src/app/demo/leads/page.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('Painel de Planejamento', 'Lead Management')
    content = content.replace(
        'Gestão estratégica de proteção familiar, planejamento de aposentadoria e blindagem patrimonial com suporte de inteligência artificial.',
        'Strategic management with artificial intelligence support. Interactive demo mode.'
    )
    content = content.replace('Simular Novo Diagnóstico', 'Simulate New Lead')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
def update_demo_page():
    filepath = 'src/app/demo/page.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('Visão Geral do Planejamento', 'System Overview')
    content = content.replace('Resultados', 'Results')
    content = content.replace('Diagnósticos Pendentes', 'New Leads')
    content = content.replace('Em Entrevista', 'Attempting Contact')
    content = content.replace('Estratégias Prontas', 'In Conversation')
    content = content.replace('Apresentações', 'Scheduled')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_demo_kanban()
update_layout()
update_leads_page()
update_demo_page()

print("All updates completed successfully!")
