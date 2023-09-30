import React, { FC, SetStateAction } from "react";
import OutgoingTableModal from "./outgoing-table-modal";
import { useStore } from "@/store";
import Button from "@/components/ui/Button";
import { Database } from "@/schema";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import OrderTableModal from "./order-table-modal";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductRow extends Product {
  skus: { id: string; stock: number; }[] | null;
  suppliers: { id: string; supplier_name: string; } | null;
  categories: { id: string; category_name: string; } | null;
}

interface Props {
  setAllCheck: React.Dispatch<SetStateAction<"ADD" | "REMOVE" | null>>;
}

const AllProductsControl: FC<Props> = ({ setAllCheck }) => {
  const checkedProducts = useStore((state) => state.checkedProducts);
  const checkedList = useStore((state) => state.checkedList);
  const resetCheckedList = useStore((state) => state.resetCheckedList);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const removeProducts = async (products: ProductRow[]) => {
    if (products.length === 0) return;
    const result = confirm(`削除して宜しいでしょうか"`);
    if (!result) return;
    products.forEach(async (product) => {
      const { error } = await supabase
        .from("products")
        .update({
          deleted_at: new Date(),
        })
        .eq("id", product?.id);
      if (error) {
        console.log(error);
        return;
      }
    });
    resetCheckedList();
    setAllCheck("REMOVE");
    router.refresh();
  };

  return (
    <div className="h-8">
      {checkedProducts && checkedList.length > 0 && (
        <div className="flex justify-between gap-3">
          <div className="flex gap-3">
            <OrderTableModal />
            <OutgoingTableModal />
          </div>
          <Button
            colorScheme="red"
            onClick={() => removeProducts(checkedProducts)}
          >
            削除
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllProductsControl;
