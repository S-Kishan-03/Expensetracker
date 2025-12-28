import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Transaction, BankAccount, Income, FixedExpense } from "../App";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  Building2,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

interface DashboardProps {
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  incomes: Income[];
  fixedExpenses: FixedExpense[];
}

export function Dashboard({ transactions, bankAccounts, incomes, fixedExpenses }: DashboardProps) {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type !== 'income';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalBankBalance = bankAccounts
    .filter(acc => acc.type !== 'Credit Card')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalCCDebt = Math.abs(
    bankAccounts
      .filter(acc => acc.type === 'Credit Card')
      .reduce((sum, acc) => sum + acc.balance, 0)
  );

  const savingsRate = totalIncome > 0 
    ? ((totalIncome - monthlyExpenses - totalFixedExpenses) / totalIncome * 100).toFixed(1)
    : 0;

  // Expense by category
  const expensesByCategory = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type !== 'income';
    })
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Payment mode distribution
  const paymentModeData = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type !== 'income';
    })
    .reduce((acc, t) => {
      acc[t.paymentMode] = (acc[t.paymentMode] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentModeData).map(([name, value]) => ({
    name,
    value
  }));

  // Essential vs Other expenses
  const essentialExpenses = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type === 'essential';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const otherExpenses = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type === 'other';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const essentialVsOther = [
    { name: 'Essential', value: essentialExpenses },
    { name: 'Other', value: otherExpenses }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-green-600">₹{totalIncome.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">Combined monthly income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-red-600">₹{(monthlyExpenses + totalFixedExpenses).toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">Fixed + Variable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Bank Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">₹{totalBankBalance.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">Across {bankAccounts.filter(a => a.type !== 'Credit Card').length} accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Savings Rate</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-purple-600">{savingsRate}%</div>
            <p className="text-slate-600 mt-1">Of monthly income</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Card Alert */}
      {totalCCDebt > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-orange-900">Credit Card Outstanding</h3>
                <p className="text-orange-700 mt-1">
                  You have ₹{totalCCDebt.toLocaleString('en-IN')} pending on credit cards. 
                  Pay before due date to avoid interest charges.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Essential vs Other */}
        <Card>
          <CardHeader>
            <CardTitle>Essential vs Other Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={essentialVsOther}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toLocaleString('en-IN')}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {essentialVsOther.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Mode Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category-wise Expenses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category-wise Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Bar dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bankAccounts.map(account => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {account.type === 'Credit Card' ? (
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Building2 className="h-5 w-5 text-blue-600" />
                  )}
                  <div>
                    <p>{account.name}</p>
                    <p className="text-slate-600">{account.type}</p>
                  </div>
                </div>
                <div className={account.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                  ₹{Math.abs(account.balance).toLocaleString('en-IN')}
                  {account.balance < 0 && ' (Due)'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Fixed Monthly Expenses (₹{totalFixedExpenses.toLocaleString('en-IN')})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixedExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p>{expense.name}</p>
                  <p className="text-slate-600">Due: {expense.dueDate}th of month</p>
                </div>
                <div className="text-blue-600">₹{expense.amount.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
