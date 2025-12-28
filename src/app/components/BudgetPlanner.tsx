import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Income, FixedExpense, Transaction } from "../App";
import { Plus, Trash2, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BudgetPlannerProps {
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  setFixedExpenses: React.Dispatch<React.SetStateAction<FixedExpense[]>>;
  transactions: Transaction[];
}

export function BudgetPlanner({ incomes, fixedExpenses, setFixedExpenses, transactions }: BudgetPlannerProps) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<FixedExpense>>({});

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount || !newExpense.dueDate || !newExpense.category) {
      alert('Please fill all required fields');
      return;
    }

    const expense: FixedExpense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: Number(newExpense.amount),
      dueDate: Number(newExpense.dueDate),
      category: newExpense.category
    };

    setFixedExpenses([...fixedExpenses, expense]);
    setNewExpense({});
    setIsAddingExpense(false);
  };

  const handleDeleteExpense = (id: string) => {
    setFixedExpenses(fixedExpenses.filter(exp => exp.id !== id));
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const variableExpenses = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type !== 'income';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = totalFixedExpenses + variableExpenses;
  const remainingBudget = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((remainingBudget / totalIncome) * 100) : 0;

  // Budget categories
  const categories = {
    Housing: fixedExpenses.filter(e => e.category === 'Housing').reduce((s, e) => s + e.amount, 0),
    Utilities: fixedExpenses.filter(e => e.category === 'Utilities').reduce((s, e) => s + e.amount, 0),
    Services: fixedExpenses.filter(e => e.category === 'Services').reduce((s, e) => s + e.amount, 0),
    Insurance: fixedExpenses.filter(e => e.category === 'Insurance').reduce((s, e) => s + e.amount, 0),
    'EMI/Loans': fixedExpenses.filter(e => e.category === 'EMI/Loans').reduce((s, e) => s + e.amount, 0),
    Other: fixedExpenses.filter(e => e.category === 'Other').reduce((s, e) => s + e.amount, 0),
  };

  const budgetData = [
    { name: 'Income', value: totalIncome, fill: '#10b981' },
    { name: 'Fixed', value: totalFixedExpenses, fill: '#3b82f6' },
    { name: 'Variable', value: variableExpenses, fill: '#f59e0b' },
    { name: 'Savings', value: Math.max(0, remainingBudget), fill: '#8b5cf6' }
  ];

  // Recommended budget (50-30-20 rule)
  const recommendedNeeds = totalIncome * 0.5;
  const recommendedWants = totalIncome * 0.3;
  const recommendedSavings = totalIncome * 0.2;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">₹{totalIncome.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">Monthly in-hand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fixed Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">₹{totalFixedExpenses.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">
              {totalIncome > 0 ? ((totalFixedExpenses / totalIncome) * 100).toFixed(1) : 0}% of income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variable Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-orange-600">₹{variableExpenses.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={remainingBudget >= 0 ? 'text-purple-600' : 'text-red-600'}>
              ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
            </div>
            <p className="text-slate-600 mt-1">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Health Alert */}
      {savingsRate < 20 ? (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-orange-900">Budget Alert</h3>
                <p className="text-orange-700 mt-1">
                  Your savings rate is {savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.
                  Consider reducing variable expenses or increasing income sources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-green-900">Great Job!</h3>
                <p className="text-green-700 mt-1">
                  You're saving {savingsRate.toFixed(1)}% of your income. Keep up the good work!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {budgetData.map((entry, index) => (
                  <bar key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 50-30-20 Rule Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>50-30-20 Budget Rule Analysis</CardTitle>
          <p className="text-slate-600">Compare your budget with the recommended 50-30-20 rule</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Needs (50% recommended)</span>
              <span className="text-blue-600">
                ₹{totalFixedExpenses.toLocaleString('en-IN')} / ₹{recommendedNeeds.toLocaleString('en-IN')}
              </span>
            </div>
            <Progress 
              value={Math.min((totalFixedExpenses / recommendedNeeds) * 100, 100)} 
              className="h-2"
            />
            <p className="text-slate-600 mt-1">
              {totalIncome > 0 ? ((totalFixedExpenses / totalIncome) * 100).toFixed(1) : 0}% of income
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span>Wants (30% recommended)</span>
              <span className="text-orange-600">
                ₹{variableExpenses.toLocaleString('en-IN')} / ₹{recommendedWants.toLocaleString('en-IN')}
              </span>
            </div>
            <Progress 
              value={Math.min((variableExpenses / recommendedWants) * 100, 100)} 
              className="h-2"
            />
            <p className="text-slate-600 mt-1">
              {totalIncome > 0 ? ((variableExpenses / totalIncome) * 100).toFixed(1) : 0}% of income
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span>Savings (20% recommended)</span>
              <span className="text-purple-600">
                ₹{Math.max(0, remainingBudget).toLocaleString('en-IN')} / ₹{recommendedSavings.toLocaleString('en-IN')}
              </span>
            </div>
            <Progress 
              value={Math.min((Math.max(0, remainingBudget) / recommendedSavings) * 100, 100)} 
              className="h-2"
            />
            <p className="text-slate-600 mt-1">
              {savingsRate.toFixed(1)}% of income
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Expenses Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fixed Monthly Expenses</CardTitle>
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fixed Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Fixed Expense</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Add a new fixed expense to your budget.
                </DialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="expenseName">Expense Name</Label>
                    <Input
                      id="expenseName"
                      placeholder="e.g., Rent, Electricity"
                      value={newExpense.name || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full p-2 border rounded"
                      value={newExpense.category || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="Housing">Housing</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Services">Services</option>
                      <option value="Insurance">Insurance</option>
                      <option value="EMI/Loans">EMI/Loans</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date (Day of Month)</Label>
                    <Input
                      id="dueDate"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="1-31"
                      value={newExpense.dueDate || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, dueDate: Number(e.target.value) })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddExpense} className="flex-1">
                      Add Expense
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingExpense(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {fixedExpenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fixed expenses added yet. Add your recurring monthly expenses!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(categories).map(([category, total]) => {
                const categoryExpenses = fixedExpenses.filter(e => e.category === category);
                if (categoryExpenses.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-slate-900 mb-3">
                      {category} (₹{total.toLocaleString('en-IN')})
                    </h3>
                    <div className="space-y-2">
                      {categoryExpenses.map(expense => (
                        <div 
                          key={expense.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="text-slate-900">{expense.name}</p>
                            <p className="text-slate-600">Due: {expense.dueDate}th of every month</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-blue-600">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Planning Tips for Bengaluru</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
              <span>
                <strong>Housing:</strong> Rent in Bengaluru typically ranges from ₹15,000-40,000. Try to keep it under 30% of income.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
              <span>
                <strong>Food & Groceries:</strong> Budget ₹8,000-15,000 for dual-income household. Use Swiggy/Zomato smartly.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
              <span>
                <strong>Transport:</strong> Ola/Uber can cost ₹5,000-8,000/month. Consider own vehicle for cost savings.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
              <span>
                <strong>Weekend Expenses:</strong> Allocate ₹8,000-12,000 for dining out, movies, and entertainment.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-2" />
              <span>
                <strong>Emergency Fund:</strong> Build 6 months expenses (₹{(totalExpenses * 6).toLocaleString('en-IN')}) before aggressive investing.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}