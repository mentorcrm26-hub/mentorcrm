import { test, expect } from '@playwright/test';

test.describe('Mentor CRM Demo', () => {
    test('should load the leads page and allow simulation', async ({ page }) => {
        // 1. Navegar para a página de demonstração
        await page.goto('/demo/leads');

        // 2. Aguardar a montagem do componente (Loading Kanban Demo... deve sumir)
        await expect(page.getByText('Loading Kanban Demo...')).not.toBeVisible({ timeout: 10000 });

        // 3. Verificar se o título do quadro está visível
        await expect(page.locator('h1')).toContainText('CRM Board');

        // 4. Verificar se as colunas iniciais do Kanban estão lá
        // Usamos filter para garantir que pegamos o título da coluna e não um lead com o mesmo nome
        const newLeadColumn = page.locator('div').filter({ hasText: /^New Lead$/ }).first();
        await expect(newLeadColumn).toBeVisible();

        // 5. Capturar a contagem inicial de leads na primeira coluna (New Lead)
        // A contagem está em um span dentro do header da coluna
        const initialCountText = await page.locator('div:has-text("New Lead") > span').first().innerText();
        const initialCount = parseInt(initialCountText);
        console.log(`Contagem inicial: ${initialCount}`);

        // 6. Clicar no botão de simulação
        await page.getByRole('button', { name: /Simulate New Lead/i }).click();

        // 7. Verificar se a contagem aumentou
        const finalCountText = await page.locator('div:has-text("New Lead") > span').first().innerText();
        const finalCount = parseInt(finalCountText);
        console.log(`Contagem final: ${finalCount}`);

        expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('should open and close the AI Chat Widget', async ({ page }) => {
        await page.goto('/demo/leads');

        // 1. Encontrar o botão do chat (MessageCircle icon)
        const chatButton = page.locator('button:has(svg.lucide-message-circle)');
        await expect(chatButton).toBeVisible();

        // 2. Abrir o chat
        await chatButton.click();

        // 3. Verificar o título do chat
        await expect(page.getByText('Mentor AI Employee')).toBeVisible();

        // 4. Fechar o chat
        await page.locator('button:has(svg.lucide-x)').first().click();

        // 5. Verificar se voltou ao botão inicial
        await expect(chatButton).toBeVisible();
    });
});
