import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useState, useEffect } from "react";
import ProductCard from "@/components/products/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

export default function AllProducts() {

    const [currentPage, setCurrentPage] = useState(1);
    const [animateItems, setAnimateItems] = useState(false);
    const pageSize = 10;

    const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
        queryKey: ["/api/products/paginate", currentPage, pageSize],
        queryFn: async () => {
            const response = await fetch(`/api/products/paginate?page=${currentPage}&pageSize=${pageSize}&sortOrder=desc`);
            return response.json();
        },
    });

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

    useEffect(() => {
        setAnimateItems(true);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primaryGreen" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryOrange opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-300 opacity-5 rounded-full"></div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                <div className={`text-center mb-12 transition-all duration-700 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                    <h1 className="text-4xl font-bold text-primaryGreen mb-2">All Grabs</h1>
                    <p className="text-gray-700">Discover more of the activities with our curated event collections</p>
                </div>

                <div className={`transition-all duration-700 delay-200 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data?.products?.length === 0 ? (
                            <p className="text-muted-foreground">No products found</p>
                        ) : (
                            <>
                                {data?.products?.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className={`transition-all duration-500 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                        style={{ transitionDelay: `${200 + index * 50}ms` }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-12">
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                                </PaginationItem>
                            )}

                            {[...Array(totalPages)].map((_, index) => (
                                <PaginationItem key={index + 1}>
                                    <PaginationLink
                                        isActive={currentPage === index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}