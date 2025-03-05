import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Username</h2>
            <p>{user?.username}</p>
          </div>
          <div>
            <h2 className="font-semibold">Name</h2>
            <p>{user?.name}</p>
          </div>
          <div>
            <h2 className="font-semibold">Email</h2>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}