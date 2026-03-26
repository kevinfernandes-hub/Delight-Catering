-- CreateTable
CREATE TABLE "MenuPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PackageItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "package_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PackageItem_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "MenuPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PackageItem_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "MenuItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuPackage_name_key" ON "MenuPackage"("name");

-- CreateIndex
CREATE INDEX "PackageItem_package_id_idx" ON "PackageItem"("package_id");

-- CreateIndex
CREATE INDEX "PackageItem_menu_id_idx" ON "PackageItem"("menu_id");
