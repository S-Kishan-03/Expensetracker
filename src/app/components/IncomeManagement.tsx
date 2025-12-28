import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Income } from "../App";
import { Plus, Trash2, Users, User, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface IncomeManagementProps {
  incomes: Income[];
  setIncomes: React.Dispatch<React.SetStateAction<Income[]>>;
}

export function IncomeManagement({ incomes, setIncomes }: IncomeManagementProps) {
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState<Partial<Income>>({
    person: 'husband'
  });

  const handleAddIncome = () => {
    if (!newIncome.source || !newIncome.amount || !newIncome.person) {
      alert('Please fill all required fields');
      return;
    }

    const income: Income = {
      id: Date.now().toString(),
      source: newIncome.source,
      amount: Number(newIncome.amount),
      person: newIncome.person as 'husband' | 'wife' | 'other'
    };

    setIncomes([...incomes, income]);
    setNewIncome({ person: 'husband' });
    setIsAddingIncome(false);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(incomes.filter(inc => inc.id !== id));
  };

  const husbandIncome = incomes
    .filter(inc => inc.person === 'husband')
    .reduce((sum, inc) => sum + inc.amount, 0);

  const wifeIncome = incomes
    .filter(inc => inc.person === 'wife')
    .reduce((sum, inc) => sum + inc.amount, 0);

  const otherIncome = incomes
    .filter(inc => inc.person === 'other')
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalIncome = husbandIncome + wifeIncome + otherIncome;

  const incomeDistribution = [
    { name: 'Husband', value: husbandIncome },
    { name: 'Wife', value: wifeIncome },
    { name: 'Other', value: otherIncome }
  ].filter(item => item.value > 0);

  const COLORS = ['#3b82f6', '#ec4899', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Income</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-purple-600">₹{totalIncome.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">Combined monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Husband's Income</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">₹{husbandIncome.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">
              {totalIncome > 0 ? ((husbandIncome / totalIncome) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Wife's Income</CardTitle>
            <User className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-pink-600">₹{wifeIncome.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">
              {totalIncome > 0 ? ((wifeIncome / totalIncome) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Other Income</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-green-600">₹{otherIncome.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">Rental, investments, etc.</p>
          </CardContent>
        </Card>
      </div>

      {/* Income Distribution Chart */}
      {incomeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toLocaleString('en-IN')}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Add Income Button */}
      <div className="flex justify-end">
        <Dialog open={isAddingIncome} onOpenChange={setIsAddingIncome}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Income Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Income Source</DialogTitle>
              <DialogDescription>
                Add a new income source to your financial plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="person">Person</Label>
                <Select
                  value={newIncome.person}
                  onValueChange={(value) => setNewIncome({ ...newIncome, person: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="husband">Husband</SelectItem>
                    <SelectItem value="wife">Wife</SelectItem>
                    <SelectItem value="other">Other (Rental, Investment, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Income Source</Label>
                <Input
                  id="source"
                  placeholder="e.g., Salary, Freelance, Rental"
                  value={newIncome.source || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="amount">Monthly Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={newIncome.amount || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddIncome} className="flex-1">
                  Add Income
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingIncome(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>All Income Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No income sources added yet. Add your first income source to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Husband's Income */}
              {incomes.filter(inc => inc.person === 'husband').length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="text-blue-900">Husband's Income Sources</h3>
                  </div>
                  <div className="space-y-2">
                    {incomes.filter(inc => inc.person === 'husband').map(income => (
                      <div 
                        key={income.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="text-slate-900">{income.source}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-blue-600">
                            ₹{income.amount.toLocaleString('en-IN')}/month
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIncome(income.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wife's Income */}
              {incomes.filter(inc => inc.person === 'wife').length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-pink-600" />
                    <h3 className="text-pink-900">Wife's Income Sources</h3>
                  </div>
                  <div className="space-y-2">
                    {incomes.filter(inc => inc.person === 'wife').map(income => (
                      <div 
                        key={income.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="text-slate-900">{income.source}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-pink-600">
                            ₹{income.amount.toLocaleString('en-IN')}/month
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIncome(income.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Income */}
              {incomes.filter(inc => inc.person === 'other').length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <h3 className="text-green-900">Other Income Sources</h3>
                  </div>
                  <div className="space-y-2">
                    {incomes.filter(inc => inc.person === 'other').map(income => (
                      <div 
                        key={income.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="text-slate-900">{income.source}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-green-600">
                            ₹{income.amount.toLocaleString('en-IN')}/month
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIncome(income.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Planning Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Income Management Tips for Dual-Income Households</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
              <span>
                <strong>50-30-20 Rule:</strong> Allocate 50% to needs, 30% to wants, and 20% to savings/investments
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
              <span>
                <strong>Emergency Fund:</strong> Build 6 months of expenses as emergency fund (₹{(totalIncome * 6).toLocaleString('en-IN')} recommended)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
              <span>
                <strong>Tax Planning:</strong> Utilize Section 80C, 80D, and other deductions to save up to ₹1.5L per person
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
              <span>
                <strong>Joint Financial Goals:</strong> Discuss and plan for house, car, children's education together
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-2" />
              <span>
                <strong>Separate Accounts:</strong> Maintain individual accounts for independence while having joint account for shared expenses
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}