import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useState } from "react";
import ProductCard from "@/components/products/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function AllProducts() {

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
        queryKey: ["/api/products/paginate", currentPage, pageSize],
        queryFn: async () => {
            const response = await fetch(`/api/products/paginate?page=${currentPage}&pageSize=${pageSize}&sortOrder=desc`);
            return response.json();
        },
    });

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

    return (
        <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-6">
            <div className="">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">All Grabs</h1>
                    <p className="text-gray-600">Discover more of the activities with our curated event collections</p>
                </div>

                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data?.products?.length === 0 ? (
                            <p className="text-muted-foreground">No products found</p>
                        ) : (
                            <>
                                {data?.products?.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8">
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
        </section>
    );
}