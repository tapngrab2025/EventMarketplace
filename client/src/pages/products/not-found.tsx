import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SearchX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryOrange opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-300 opacity-5 rounded-full"></div>

      <div className="container mx-auto px-4 py-32 relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-primaryGreen mb-6">
          <SearchX className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-primaryGreen mb-3">Not Found</h1>
        <p className="text-gray-700 max-w-xl mx-auto">
          We couldn't find the product you're looking for. It may have been removed or is temporarily unavailable.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/products">
            <Button className="bg-teal-500 text-white hover:bg-primaryOrange">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Grabs
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="outline" className="border-teal-300 text-primaryGreen hover:bg-teal-50">
              Explore Events
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-gray-700 hover:text-primaryGreen">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}