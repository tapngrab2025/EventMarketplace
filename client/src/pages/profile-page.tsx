import { useAuth } from "@/hooks/use-auth";
import { Pencil, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username,
    name: user?.name,
    email: user?.email,

    // Profile data
    bio: profile?.bio ?? '',
    dob: profile?.dob ?? '',
    gender: profile?.gender ?? '',
    imageUrl: profile?.imageUrl ?? '',
    address: profile?.address ?? '',
    contact: profile?.contact ?? '',
    city: profile?.city ?? '',
    country: profile?.country ?? '',
    postalCode: profile?.postalCode ?? '',
    phoneNumber: profile?.phoneNumber ?? '',
    socialMedia: profile?.socialMedia ?? {},
    occupation: profile?.occupation ?? '',
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
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
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
        // Validate required fields
        const requiredFields = {
          username: "Username",
          name: "Full Name",
          email: "Email",
          dob: "Date of Birth",
          gender: "Gender",
          phoneNumber: "Phone Number"
        };
    
        const missingFields = Object.entries(requiredFields)
          .filter(([key]) => !formData[key as keyof typeof formData])
          .map(([_, label]) => label);
    
        if (missingFields.length > 0) {
          toast({
            title: "Validation Error",
            description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
            variant: "destructive",
          });
          return;
        }
    
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
                <Label htmlFor="username">Username <span className="text-red-500 ml-1">*</span></Label>
                {isEditing ? (
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    readOnly
                  />
                ) : (
                  <p className="mt-1">{user?.username}</p>
                )}
              </div>
              <div>
                <Label htmlFor="name">Full Name <span className="text-red-500 ml-1">*</span></Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                <Label htmlFor="email">Email <span className="text-red-500 ml-1">*</span></Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="mt-1">{user?.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500 ml-1">*</span></Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="mt-1">{profile?.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dob">Date of Birth <span className="text-red-500 ml-1">*</span></Label>
                {isEditing ? (
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="mt-1">{profile?.dob}</p>
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
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="not_to_disclose">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="mt-1">{profile?.gender}</p>
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
                  <p className="mt-1">{profile?.bio}</p>
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
                  <p className="mt-1">{profile?.address}</p>
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
                  <p className="mt-1">{profile?.city}</p>
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
                  <p className="mt-1">{profile?.country}</p>
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
                  <p className="mt-1">{profile?.postalCode}</p>
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
                <p className="mt-1">{profile?.occupation}</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}