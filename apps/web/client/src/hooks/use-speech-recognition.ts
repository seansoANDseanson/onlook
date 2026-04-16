'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
    onTranscript?: (text: string) => void;
    lang?: string;
    continuous?: boolean;
}

function getSpeechRecognitionConstructor(): (new () => any) | null {
    if (typeof window === 'undefined') {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useSpeechRecognition({
    onTranscript,
    lang = 'en-US',
    continuous = true,
}: UseSpeechRecognitionOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const onTranscriptRef = useRef(onTranscript);

    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    useEffect(() => {
        setIsSupported(!!getSpeechRecognitionConstructor());
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
        if (!SpeechRecognitionCtor) {
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result?.[0] && result.isFinal) {
                    finalTranscript += result[0].transcript;
                }
            }

            if (finalTranscript && onTranscriptRef.current) {
                onTranscriptRef.current(finalTranscript);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            if (event.error !== 'aborted') {
                console.error('Speech recognition error:', event.error);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [lang, continuous]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    return {
        isListening,
        isSupported,
        startListening,
        stopListening,
        toggleListening,
    };
}
