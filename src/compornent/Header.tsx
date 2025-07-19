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
  Badge,
} from "@nextui-org/react";
import IconCart from "./IconCart";
import { orderListCart } from "../actions/orderActions";

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
  }, [status]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.addEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Navbar className="bg-transparent shadow-lg py-5">
        <NavbarBrand>
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
          >
            Nimbus
          </Link>
        </NavbarBrand>

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
                    onClick={() => signOut()}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            status === "unauthenticated" && (
              <Button
                onClick={() => signIn()}
                className="py-2 px-4 bg-white text-black hover:bg-gray-100/15 hover:text-white text-lg font-semibold rounded-xl hover:border border-solid border-white"
              >
                Sign In
              </Button>
            )
          )}
        </NavbarContent>
      </Navbar>
    </>
  );
}
