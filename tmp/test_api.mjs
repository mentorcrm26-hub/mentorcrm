async function test() {
    try {
        const res = await fetch('https://mentorcrm.site/api/automations/reminders', {
            headers: { 'Accept': 'application/json' }
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Headers:', res.headers);
        console.log('Body snippet:', text.substring(0, 500));
    } catch(e) {
        console.error(e);
    }
}
test();
