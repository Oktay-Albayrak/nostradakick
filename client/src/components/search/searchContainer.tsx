"use client";

import { useState } from "react";
import SearchOverlay from "./searchOverlay";
import MobileNavbar from "../mobileNavbar/MobileNavbar";

export default function SearchContainer() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* L'overlay qui s'affiche par dessus tout */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Ta barre de navigation en bas */}
      <MobileNavbar onSearchClick={() => setIsSearchOpen(true)} />
    </>
  );
}
