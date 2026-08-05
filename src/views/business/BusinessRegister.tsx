"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Phone,
  Check,
  Search,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useAuthService } from "@/services/authService";
import { toast } from "react-toastify";
import { BUSINESS_CATEGORIES } from "@/constants";
import Seo from "@/components/seo/Seo";
import BusinessSearchInput from "@/components/shared/BusinessSearchInput";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const BusinessRegister = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<any>("");
  const [personName, setPersonName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [manualBusinessLocation, setManualBusinessLocation] = useState("");
  const [businessPlaceId, setBusinessPlaceId] = useState<string>("");
  const [businessLat, setBusinessLat] = useState<number | null>(null);
  const [businessLng, setBusinessLng] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [keyboardNavIndex, setKeyboardNavIndex] = useState(-1);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { registerBusiness } = useAuthService();

  // Filter categories based on search
  const filteredCategories = BUSINESS_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  // Handle keyboard navigation in category dropdown
  useEffect(() => {
    if (!isSelectOpen) {
      setKeyboardNavIndex(-1);
      setCategorySearch("");
      return;
    }
    setKeyboardNavIndex(-1);
  }, [isSelectOpen]);

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardNavIndex((prev) =>
        prev < filteredCategories.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardNavIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        keyboardNavIndex >= 0 &&
        keyboardNavIndex < filteredCategories.length
      ) {
        const category = filteredCategories[keyboardNavIndex];
        if (selectedCategories.includes(category)) {
          setSelectedCategories(
            selectedCategories.filter((c) => c !== category),
          );
        } else if (selectedCategories.length < 2) {
          setSelectedCategories([...selectedCategories, category]);
          setKeyboardNavIndex(-1);
          setCategorySearch("");
        } else {
          toast("You can select a maximum of 2 categories");
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSelectOpen(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedManualBusinessLocation = manualBusinessLocation.trim();
    const hasGoogleBusinessSelection = Boolean(
      businessPlaceId && businessAddress,
    );

    if (
      !businessName ||
      !email ||
      !personName ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!hasGoogleBusinessSelection && !trimmedManualBusinessLocation) {
      toast.error(
        "Please select your business from Google or enter your business location manually.",
      );
      return;
    }

    if (
      hasGoogleBusinessSelection &&
      (businessLat === null || businessLng === null)
    ) {
      toast.error(
        "We couldn't fetch your business coordinates from Google. Please select the business again.",
      );
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one business category");
      return;
    }

    if (selectedCategories.length > 2) {
      toast.error("You can select a maximum of 2 categories");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const normalizeCategory = (str) => {
      return str.toLowerCase().trim().replace(/\s+/g, "-");
    };

    try {
      const browserTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const resolvedBusinessAddress = hasGoogleBusinessSelection
        ? businessAddress
        : trimmedManualBusinessLocation;
      const response = await registerBusiness(dispatch, {
        name: businessName,
        email,
        password,
        phone: phone,
        categories: selectedCategories.map(normalizeCategory),
        personName,
        businessAddress: resolvedBusinessAddress,
        placeId: hasGoogleBusinessSelection ? businessPlaceId : undefined,
        lat: hasGoogleBusinessSelection
          ? (businessLat ?? undefined)
          : undefined,
        lng: hasGoogleBusinessSelection
          ? (businessLng ?? undefined)
          : undefined,
        timezone: browserTimezone,
      });

      console.log("Registration response:", response);

      if (response) {
        toast("Your business account has been created successfully.");
        router.push("/business/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      toast.error(
        err?.message || "Business registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Seo
        title="Business registration"
        description="Create a business account on Complisk to publish local promotions and manage campaigns."
        pathname="/business/register"
        noindex
      />
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-6">
            <Logo size="lg" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Register Your Business
          </h1>
          <p className="text-muted-foreground mb-6">
            Create an account to start promoting your business
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Business Category Selection - Select Dropdown (Max 2) */}
            <div className="space-y-2">
              <Label htmlFor="categories">
                Business Categories (Select up to 2)
              </Label>
              <div className="space-y-2">
                {/* Display selected categories as badges */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center gap-2 bg-primary/10 border border-primary rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-primary">
                          {category}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategories(
                              selectedCategories.filter((c) => c !== category),
                            )
                          }
                          className="text-primary hover:text-primary/80 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category selector with search */}
                <div className="relative">
                  <Select open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedCategories.length > 0
                            ? `${selectedCategories.length} category/categories selected`
                            : "Select a business category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 p-0">
                      {/* Search Input */}
                      <div className="sticky top-0 p-2 border-b bg-background z-10">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            ref={categoryInputRef}
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => {
                              setCategorySearch(e.target.value);
                              setKeyboardNavIndex(-1);
                            }}
                            onKeyDown={handleCategoryKeyDown}
                            autoFocus
                            className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background"
                          />
                        </div>
                      </div>

                      {/* Category Options */}
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category, index) => (
                            <button
                              key={category}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedCategories.includes(category)) {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (c) => c !== category,
                                    ),
                                  );
                                } else if (selectedCategories.length < 2) {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    category,
                                  ]);
                                  setCategorySearch("");
                                } else {
                                  toast(
                                    "You can select a maximum of 2 categories",
                                  );
                                }
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 transition-colors flex items-center gap-2 border-l-4",
                                selectedCategories.includes(category)
                                  ? "bg-primary/10 text-primary font-medium border-l-primary"
                                  : keyboardNavIndex === index
                                    ? "bg-muted text-foreground border-l-muted-foreground"
                                    : "hover:bg-muted text-foreground border-l-transparent",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                  selectedCategories.includes(category)
                                    ? "border-primary bg-primary"
                                    : "border-border",
                                )}
                              >
                                {selectedCategories.includes(category) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="flex-1">
                                {category
                                  ?.split("-") // split by '-'
                                  ?.map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  ) // capitalize first letter
                                  ?.join(" ")}
                              </span>
                              {keyboardNavIndex === index && (
                                <span className="text-xs text-muted-foreground">
                                  ↵
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            No categories found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="Your Business"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Contact Person Name */}
            <div className="space-y-2">
              <Label htmlFor="personName">Contact Person Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="personName"
                  placeholder="John Doe"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Google Business Match */}
            <div className="space-y-2">
              <Label>Find your business on Google</Label>
              <BusinessSearchInput
                onSelectBusiness={(place) => {
                  setBusinessPlaceId(place.placeId);
                  setBusinessLat(
                    Number.isFinite(Number(place.lat))
                      ? Number(place.lat)
                      : null,
                  );
                  setBusinessLng(
                    Number.isFinite(Number(place.lng))
                      ? Number(place.lng)
                      : null,
                  );
                  setBusinessAddress(
                    place.formattedAddress || place.description || "",
                  );
                  setManualBusinessLocation("");
                }}
              />

              {businessPlaceId ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{businessName}</p>
                  <p className="text-xs text-muted-foreground">
                    {businessAddress}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Search and select your business to continue.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualBusinessLocation">
                Business Location (Type your business name here if not listed on
                Google)
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="manualBusinessLocation"
                  placeholder="Enter your business location manually"
                  value={manualBusinessLocation}
                  onChange={(e) => setManualBusinessLocation(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use this if your business is not available in Google search.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative flex items-center w-full h-10 rounded-md border border-input bg-transparent pl-3 pr-1 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    disabled={isLoading}
                    className="w-full border-0 bg-transparent flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/business/login"
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Customer View
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground"
        >
          <Building2 className="h-24 w-24 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Join hundreds of Businesses
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            Create promotions, reach local customers, and grow your business
            with Complisk.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">5000+</div>
              <div className="text-sm opacity-70">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">100's+</div>
              <div className="text-sm opacity-70">Businesses</div>
            </div>
            <div>
              <div className="text-4xl font-bold">98%</div>
              <div className="text-sm opacity-70">Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessRegister;
