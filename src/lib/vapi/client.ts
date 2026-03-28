/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import Vapi from '@vapi-ai/web';

/**
 * Utilitário para gerenciar a conexão com a Vapi.ai
 * Responsável por iniciar chamadas de voz e gerenciar eventos de áudio.
 */
class VapiService {
    private vapi: Vapi | null = null;
    private publicKey: string;

    constructor() {
        this.publicKey = process.env.NEXT_PUBLIC_VAPI_API_KEY_PUBLIC || '';
    }

    // Inicializa o SDK apenas no lado do cliente
    init() {
        if (typeof window !== 'undefined' && !this.vapi) {
            if (!this.publicKey) {
                console.warn('Vapi Public Key não configurada no .env');
            }
            this.vapi = new Vapi(this.publicKey);
            this.setupListeners();
        }
        return this.vapi;
    }

    private setupListeners() {
        if (!this.vapi) return;

        this.vapi.on('call-start', () => {
            console.log('Voice AI: Chamada iniciada');
        });

        this.vapi.on('call-end', () => {
            console.log('Voice AI: Chamada finalizada');
        });

        this.vapi.on('error', (error) => {
            console.error('Voice AI: Erro na chamada', error);
        });
    }

    /**
     * Inicia uma conversação de voz com um Assistente específico
     * @param assistantId ID do assistente configurado no painel da Vapi
     */
    async startAssistantCall(assistantId: string) {
        const vapiInstance = this.init();
        if (!vapiInstance) return;

        try {
            await vapiInstance.start(assistantId);
        } catch (error) {
            console.error('Falha ao iniciar conversa de voz:', error);
            throw error;
        }
    }

    /**
     * Finaliza a chamada atual
     */
    stopCall() {
        if (this.vapi) {
            this.vapi.stop();
        }
    }

    /**
     * Alterna o estado do microfone (Mute/Unmute)
     */
    setMuted(mute: boolean) {
        if (this.vapi) {
            this.vapi.setMuted(mute);
        }
    }
}

export const vapiService = new VapiService();
