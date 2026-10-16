import Spinner from "@/components/shared/Spinner";

export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
