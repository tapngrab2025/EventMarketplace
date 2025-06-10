import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from "@/components/ui/button";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export default function SignUp() {
    const [subscriber, setSubscriber] = useState("");


    const submitSubscriber = useMutation({
        mutationFn: async () => {
            if (!subscriber.trim()) {
                throw new Error("Please enter an email address");
            }
            if (!subscriber.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                throw new Error("Please enter a valid email address");
            }
            const res = await apiRequest("POST", "/api/subscribers", {
                email: subscriber.trim().toLowerCase()
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to subscribe");
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Success!",
                description: "You have been subscribed successfully!",
                variant: "default"
            });
            setSubscriber("");
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
            setSubscriber("");
        }

    });

    return (
        <section className="relative bg-[#1B0164] bg-cover bg-center text-white py-4 md:py-24">
            <div className="container mx-auto px-6 flex items-center justify-center gap-x-28 flex-col lg:flex-row">
                <h2 className="text-h2 font-bold text-center">Sign up for Newsletter!</h2>
                <div className="flex items-center flex-col lg:flex-row gap-y-8 lg:gap-0">
                    <Input
                        placeholder="Enter your email"
                        value={subscriber}
                        onChange={(e) => setSubscriber(e.target.value)}
                        className="lg:w-96 bg-transparent border-0 border-b-2 border-white rounded-none text-white placeholder-gray-300 focus:outline-none mr-4 py-2"
                    />
                    <Button
                        variant="outline"
                        onClick={() => submitSubscriber.mutate()}
                        className="bg-[#00C4B4] text-white border-none font-semibold py-2 px-6 rounded-full hover:bg-[#00b4a4] transition duration-300"
                    >
                        Subscribe
                    </Button>
                </div>
            </div>
        </section>
    );
};
