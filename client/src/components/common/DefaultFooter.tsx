import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./logo";

export function DefaultFooter() {
    const { user, logoutMutation } = useAuth();
    return (
        <footer className="bg-black text-white p-8">
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center mb-4">
                        <Logo />
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                    <div className="flex space-x-4">
                        <span className="material-icons text-gray-400 hover:text-white cursor-pointer">facebook</span>
                        <span className="material-icons text-gray-400 hover:text-white cursor-pointer">photo_camera</span>
                        <span className="material-icons text-gray-400 hover:text-white cursor-pointer">close</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">About Us</h3>
                    {user?.role === "customer" && (
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><a href="/profile" className="hover:text-white">My Profile</a></li>
                            <li><a href="#" className="hover:text-white">All Venues</a></li>
                            <li><a href="#" className="hover:text-white">All Locations</a></li>
                        </ul>
                    ) }
                    {(user?.role === "vendor" || user?.role === "organizer") && (
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li><a href={user?.role === "vendor" ? "/vendor" : "/organizer"} className="hover:text-white">Dashboard</a></li>
                        <li><a href="#" className="hover:text-white">Submit Event</a></li>
                        <li><a href="#" className="hover:text-white">All Locations</a></li>
                    </ul>
                    ) }
                    {user?.role === "admin" && (
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" className="hover:text-white">Submit Event</a></li>
                        <li><a href="/admin" className="hover:text-white">Admin Dashboard</a></li>
                        <li><a href="/users" className="hover:text-white">All Users</a></li>
                    </ul>
                    ) }
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li className="flex items-center">
                            <span className="material-icons text-gray-400 mr-2">location_on</span>
                            San Francisco City Hall, San Francisco, CA
                        </li>
                        <li className="flex items-center">
                            <span className="material-icons text-gray-400 mr-2">email</span>
                            <a href="mailto:contact@domain.com" className="hover:text-white">contact@domain.com</a>
                        </li>
                        <li className="flex items-center">
                            <span className="material-icons text-gray-400 mr-2">phone</span>
                            <a href="tel:+01101234567" className="hover:text-white">(+011) 01234567</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Download App</h3>
                    <div className="space-y-4">
                        <a href="#" className="flex items-center bg-gray-800 hover:bg-gray-700 p-2 rounded-lg">
                            <span className="material-icons text-white mr-2">apple</span>
                            <div>
                                <p className="text-xs text-gray-400">Download on the</p>
                                <p className="text-sm font-semibold">App Store</p>
                            </div>
                        </a>
                        <a href="#" className="flex items-center bg-gray-800 hover:bg-gray-700 p-2 rounded-lg">
                            <span className="material-icons text-white mr-2">android</span>
                            <div>
                                <p className="text-xs text-gray-400">Get it on</p>
                                <p className="text-sm font-semibold">Google Play</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};