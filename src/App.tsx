import { AllocationPage } from './features/target-allocation/ui/AllocationPage'

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Мои Инвестиции</h1>
      </header>
      <main className="app-main">
        <AllocationPage />
      </main>
    </div>
  )
}
