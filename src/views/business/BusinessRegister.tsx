"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  ArrowLeft,
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
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
import { formatCategoryLabel } from "@/lib/deal";
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
    <>
      <Seo
        title="Business registration"
        description="Create a business account on Hopping Deals to publish local promotions and manage campaigns."
        pathname="/business/register"
        noindex
      />
      <AuthShell
        wide
        title="Register your business"
        subtitle="Create a free business page now. Subscribe when you’re ready to run a live deal."
        aside={{
          scene: "launch",
          eyebrow: "For business owners",
          title: "Launch a local deal without an ad agency.",
          points: [
            "Flat-fee promotions. No bidding, no commission.",
            "Target the exact cities and dates you want.",
            "Save templates and reuse them for every season.",
          ],
        }}
        footer={
          <>
            <p>
              Already registered? <AuthLink href="/business/login">Log in to the business portal</AuthLink>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 pt-2 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to the shopper site
            </Link>
          </>
        }
      >
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Business Category Selection - Select Dropdown (Max 2) */}
            <div className="space-y-2">
              <Label htmlFor="categories">
                Business categories (up to 2)
              </Label>
              <div className="space-y-2">
                {/* Display selected categories as badges */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 py-1.5 pl-3 pr-2"
                      >
                        <span className="text-sm font-medium text-gold">
                          {formatCategoryLabel(category)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategories(
                              selectedCategories.filter((c) => c !== category),
                            )
                          }
                          aria-label={`Remove ${formatCategoryLabel(category)}`}
                          className="grid h-5 w-5 place-items-center rounded-full text-xs font-bold text-gold/80 hover:bg-gold/20 hover:text-gold"
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
                      <div className="sticky top-0 z-10 border-b bg-popover p-2">
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
                            className="w-full rounded-lg border border-input bg-secondary/60 py-2 pl-8 pr-3 text-sm focus:border-gold/60 focus:outline-none"
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
                                  ? "bg-gold/10 text-gold font-medium border-l-gold"
                                  : keyboardNavIndex === index
                                    ? "bg-muted text-foreground border-l-muted-foreground"
                                    : "hover:bg-muted text-foreground border-l-transparent",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                  selectedCategories.includes(category)
                                    ? "border-gold bg-gold"
                                    : "border-border",
                                )}
                              >
                                {selectedCategories.includes(category) && (
                                  <Check className="h-3 w-3 text-gold-foreground" />
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
              <Label htmlFor="businessName">Business name</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              <Label htmlFor="personName">Contact name</Label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <div className="rounded-xl border border-success/40 bg-success/10 p-3">
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
                Not on Google? Enter your business location
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Label htmlFor="phone">Phone (optional)</Label>
                <div className="relative flex h-11 w-full items-center rounded-xl border border-input bg-secondary/60 py-2 pl-3.5 pr-1 text-sm transition-colors focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-ring/40">
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
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
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
              {isLoading ? "Creating account…" : "Create business account"}
            </Button>
          </form>
      </AuthShell>
    </>
  );
};

export default BusinessRegister;
