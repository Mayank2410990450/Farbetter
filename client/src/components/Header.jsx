import { Heart, User, Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FarbetterLogo from "@assets/generated_images/Farbetter_logo.png";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import ShoppingCartComponent from "@/components/ShoppingCart";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "@/api/category";

export default function Header({ cartCount = 0, wishlistCount = 0 }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [categories, setCategories] = useState([
    { name: "Protein Puffs", slug: "protein-puffs" },
    { name: "Protein Chips", slug: "protein-chips" },
    { name: "Protein Bites", slug: "protein-bites" },
    { name: "Protein Bars", slug: "protein-bars" },
  ]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchCategories();
        // data might be array of categories or { categories: [...] }
        const list = Array.isArray(data) ? data : data?.categories ?? [];
        if (!mounted) return;
        if (list.length > 0) {
          // Map backend shape to { name, slug }
          const mapped = list.map((c) => ({
            name: c.name || c.title || c.label || "Category",
            slug: c.slug || (c.name && c.name.toLowerCase().replace(/\s+/g, "-")) || "category",
          }));
          setCategories(mapped);
        }
      } catch (err) {
        // keep defaults on error
        console.error("Failed to load categories:", err);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const onSearchKey = (e) => {
    if (e.key === 'Enter') {
      const q = (searchTerm || '').trim();
      if (q.length === 0) return;
      navigate(`/shop?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu & Logo Group */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu" aria-label="Open mobile menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/">
                    <div className="text-base font-semibold hover-elevate active-elevate-2 px-4 py-2 rounded-md cursor-pointer" data-testid="link-mobile-home">
                      Home
                    </div>
                  </Link>
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Shop</p>
                    <Link to="/shop">
                      <div className="block py-2 text-sm font-semibold hover-elevate active-elevate-2 px-2 rounded-md cursor-pointer text-primary">
                        All Products
                      </div>
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.name} to={`/shop?category=${cat.slug}`}>
                        <div className="block py-2 text-sm hover-elevate active-elevate-2 px-2 rounded-md cursor-pointer">
                          {cat.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/about">
                    <div className="text-base font-semibold hover-elevate active-elevate-2 px-4 py-2 rounded-md cursor-pointer" data-testid="link-mobile-about">
                      About Us
                    </div>
                  </Link>
                  <Link to="/contact">
                    <div className="text-base font-semibold hover-elevate active-elevate-2 px-4 py-2 rounded-md cursor-pointer" data-testid="link-mobile-contact">
                      Contact
                    </div>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={FarbetterLogo}
                  alt="Farbetter"
                  className="h-[10rem] w-auto object-contain transition-all dark:invert"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex ml-4">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md" data-testid="link-home">
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger data-testid="button-shop-menu">Shop</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      {/* Shop All Products Link */}
                      <NavigationMenuLink asChild>
                        <Link to="/shop" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover-elevate active-elevate-2 font-semibold bg-primary/5" data-testid="link-shop-all">
                          <div className="text-sm font-semibold leading-none text-primary">Shop All Products</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse our complete collection
                          </p>
                        </Link>
                      </NavigationMenuLink>

                      {/* Category Links */}
                      {categories.map((cat) => (
                        <NavigationMenuLink key={cat.name} asChild>
                          <Link to={`/shop?category=${cat.slug}`} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover-elevate active-elevate-2" data-testid={`link-${cat.name.toLowerCase()}`}>
                            <div className="text-sm font-medium leading-none">{cat.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              High-protein {cat.name.toLowerCase()} for healthy snacking
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/about" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md" data-testid="link-about">
                      About Us
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/contact" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md" data-testid="link-contact">
                      Contact
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1"
                data-testid="input-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKey}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <ThemeToggle />

            <ShoppingCartComponent />

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-account" aria-label="Open account menu">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                          <AvatarFallback>
                            {user.firstName?.[0] || user.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel data-testid="text-user-name">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email || "My Account"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/user/dashboard" className="flex items-center gap-2">
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/user/dashboard#orders" className="flex items-center gap-2">
                          <span>Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/user/dashboard#wishlist" className="flex items-center gap-2">
                          <span>Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={async () => { await logout(); navigate('/'); }}>
                        <div className="flex items-center gap-2 cursor-pointer" data-testid="button-logout">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="default" size="sm" data-testid="button-login">
                    <Link to="/login">Log In</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



