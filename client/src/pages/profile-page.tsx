import { useAuth } from "@/hooks/use-auth";
import { Pencil, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username,
    name: user?.name,
    email: user?.email,
    // profileImage: user?.profileImage
    bio: user?.bio,
    dob: user?.dob,
    gender: user?.gender,
    imageUrl: user?.imageUrl,
    address: user?.address,
    contact: user?.contact,
    city: user?.city,
    country: user?.country,
    postalCode: user?.postalCode,
    phoneNumber: user?.phoneNumber,
    socialMedia: user?.socialMedia,
    occupation: user?.occupation,
  })
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    // TODO: Implement update profile API call
    // setIsEditing(false);
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSubmit} variant="default">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4 grid grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.username}</p>
                )}
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.dob}</p>
                )}
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <select
                    id="gender"
                    name="gender"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="not_to_disclose">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="mt-1">{user?.gender}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{user?.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Address Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                {isEditing ? (
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.country}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                {isEditing ? (
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{user?.postalCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              {isEditing ? (
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">{user?.occupation}</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}