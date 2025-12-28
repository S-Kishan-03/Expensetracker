import { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { 
  LayoutDashboard, 
  Wallet, 
  Building2, 
  IndianRupee, 
  PiggyBank,
  TrendingUp
} from "lucide-react";
import { storage } from "./utils/db";

const Dashboard = lazy(() => import("./components/Dashboard").then(module => ({ default: module.Dashboard })));
const ExpenseTracker = lazy(() => import("./components/ExpenseTracker").then(module => ({ default: module.ExpenseTracker })));
const BankAccounts = lazy(() => import("./components/BankAccounts").then(module => ({ default: module.BankAccounts })));
const IncomeManagement = lazy(() => import("./components/IncomeManagement").then(module => ({ default: module.IncomeManagement })));
const BudgetPlanner = lazy(() => import("./components/BudgetPlanner").then(module => ({ default: module.BudgetPlanner })));
const InvestmentInsurance = lazy(() => import("./components/InvestmentInsurance").then(module => ({ default: module.InvestmentInsurance })));
const SIP = lazy(() => import("./components/InvestmentInsurance").then(module => ({ default: module.SIP })));
const Insurance = lazy(() => import("./components/InvestmentInsurance").then(module => ({ default: module.Insurance })));

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: 'essential' | 'other' | 'income';
  paymentMode: 'UPI' | 'CC' | 'Cash' | 'Debit';
  bankAccount?: string;
  description: string;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  type: 'Savings' | 'Current' | 'Credit Card';
  lastUpdated: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  person: 'husband' | 'wife' | 'other';
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = storage.getItem<Transaction[]>('transactions');
    return saved || [];
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = storage.getItem<BankAccount[]>('bankAccounts');
    return saved || [
      {
        id: '1',
        name: 'HDFC Salary Account',
        balance: 85000,
        type: 'Savings',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        name: 'ICICI Savings',
        balance: 45000,
        type: 'Savings',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        name: 'HDFC Credit Card',
        balance: -15000,
        type: 'Credit Card',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        name: 'SBI Savings',
        balance: 25000,
        type: 'Savings',
        lastUpdated: new Date().toISOString()
      }
    ];
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = storage.getItem<Income[]>('incomes');
    return saved || [
      { id: '1', source: 'Salary', amount: 95000, person: 'husband' },
      { id: '2', source: 'Salary', amount: 85000, person: 'wife' }
    ];
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    const saved = storage.getItem<FixedExpense[]>('fixedExpenses');
    return saved || [
      { id: '1', name: 'Rent', amount: 25000, dueDate: 5, category: 'Housing' },
      { id: '2', name: 'Electricity', amount: 2500, dueDate: 10, category: 'Utilities' },
      { id: '3', name: 'Internet', amount: 1200, dueDate: 15, category: 'Utilities' },
      { id: '4', name: 'Maid', amount: 3000, dueDate: 1, category: 'Services' }
    ];
  });

  const [sips, setSips] = useState<SIP[]>(() => {
    const saved = storage.getItem<SIP[]>('sips');
    return saved || [];
  });

  const [insurances, setInsurances] = useState<Insurance[]>(() => {
    const saved = storage.getItem<Insurance[]>('insurances');
    return saved || [];
  });

  useEffect(() => {
    storage.setItem('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    storage.setItem('bankAccounts', bankAccounts);
  }, [bankAccounts]);

  useEffect(() => {
    storage.setItem('incomes', incomes);
  }, [incomes]);

  useEffect(() => {
    storage.setItem('fixedExpenses', fixedExpenses);
  }, [fixedExpenses]);

  useEffect(() => {
    storage.setItem('sips', sips);
  }, [sips]);

  useEffect(() => {
    storage.setItem('insurances', insurances);
  }, [insurances]);

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>FinanceHub</h1>
              <p className="text-slate-600">Your Complete Financial Management Solution</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
          <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              <span className="hidden sm:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="banks" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Banks</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Investment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              transactions={transactions}
              bankAccounts={bankAccounts}
              incomes={incomes}
              fixedExpenses={fixedExpenses}
            />
          </TabsContent>

          <TabsContent value="income">
            <IncomeManagement 
              incomes={incomes}
              setIncomes={setIncomes}
            />
          </TabsContent>

          <TabsContent value="banks">
            <BankAccounts 
              bankAccounts={bankAccounts}
              setBankAccounts={setBankAccounts}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracker 
              transactions={transactions}
              setTransactions={setTransactions}
              bankAccounts={bankAccounts}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetPlanner 
              incomes={incomes}
              fixedExpenses={fixedExpenses}
              setFixedExpenses={setFixedExpenses}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="investment">
            <InvestmentInsurance 
              sips={sips}
              setSips={setSips}
              insurances={insurances}
              setInsurances={setInsurances}
              totalIncome={totalIncome}
            />
          </TabsContent>
        </Tabs>
      </Suspense>
    </main>
  </div>
);}
