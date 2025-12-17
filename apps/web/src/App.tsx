import PWABadge from "./PWABadge.tsx";
import { Button } from "./components/ui/button.tsx";

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
