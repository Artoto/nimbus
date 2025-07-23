"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Badge,
} from "@nextui-org/react";
import IconCart from "./IconCart";
import { orderListCart } from "../actions/orderActions";
import { usePathname } from "next/navigation";

interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function Header() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [countCart, setCountCart] = useState<number>(0);
  const { data: session, status } = useSession();
  const route = useRouter();
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuItems = ["Manage Order", "Menu Order"];
  const menuLinks = ["/manage", "menu"];
  // Function to check if current path matches a base path (including subpaths)
  const isPathActive = (basePath: string): boolean => {
    return pathName.startsWith(basePath);
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 30) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const handleOrderCart = async () => {
    if (session) {
      let user: userProps | any = session.user;
      const result = await orderListCart(user);
      if (result?.total) {
        setCountCart(result?.total);
      }
    }
  };

  useEffect(() => {
    handleOrderCart();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // Fix: should be removeEventListener
    };
  }, [status]);

  return (
    <>
      <Navbar
        className="bg-transparent shadow-lg py-5"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        </NavbarContent>

        <NavbarContent className="sm:hidden pr-3" justify="center">
          <NavbarBrand>
            <Link
              href={status === "authenticated" ? `/profile` : `/`}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900"
            >
              Nimbus
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarBrand>
          <Link
            href={status === "authenticated" ? `/profile` : `/`}
            className="hidden sm:flex text-2xl sm:text-3xl font-extrabold text-gray-900"
          >
            Nimbus
          </Link>
        </NavbarBrand>
        {status === "authenticated" && (
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem isActive={isPathActive("/manage")}>
              <Link
                className={`text-gray-900 ${
                  isPathActive("/manage") ? ` underline underline-offset-1` : ``
                }`}
                href="/manage"
              >
                Manage Order
              </Link>
            </NavbarItem>

            <NavbarItem isActive={isPathActive("/menu")}>
              <Link
                className={`text-gray-900 ${
                  isPathActive("/menu") ? ` underline underline-offset-1` : ``
                }`}
                href="/menu"
              >
                Menu Order
              </Link>
            </NavbarItem>
          </NavbarContent>
        )}

        <NavbarContent as="div" justify="end">
          {status === "authenticated" ? (
            <>
              <Badge
                color="danger"
                content={countCart}
                isInvisible={countCart > 0 ? false : true}
                shape="circle"
              >
                <Link href="/buyer" className="text-gray-900">
                  <IconCart width="40" height="40" />
                </Link>
              </Badge>

              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    name={session.user?.name || ""}
                    size="md"
                    src={session.user?.image || "/img/Avatar.png"}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">
                      {session.user?.email || "-"}
                    </p>
                  </DropdownItem>
                  <DropdownItem key="settings">
                    <Link href="/profile" className="text-white">
                      My Profile
                    </Link>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() => signOut()}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            status === "unauthenticated" && (
              <button
                onClick={() => signIn()}
                className="py-2 px-4 bg-white text-black hover:bg-gray-100/15 hover:text-white text-lg font-semibold rounded-xl hover:border border-solid border-white"
              >
                Sign In
              </button>
            )
          )}
        </NavbarContent>

        <NavbarMenu className="mt-10">
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full"
                color={"foreground"}
                href={menuLinks[index]}
              >
                {item}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </>
  );
}
