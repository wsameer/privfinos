import PWABadge from "./PWABadge.tsx";
import { Button } from "@workspace/ui/components/button";

function App() {
  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button>Click me</Button>
      </div>
      <PWABadge />
    </>
  );
}

export default App;
