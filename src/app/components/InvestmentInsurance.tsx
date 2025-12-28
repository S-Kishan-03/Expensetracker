import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, TrendingUp, Shield, LineChart, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export interface SIP {
  id: string;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  category: 'Equity' | 'Debt' | 'Hybrid' | 'Index Fund' | 'ELSS';
  startDate: string;
  expectedReturn: number;
}

export interface Insurance {
  id: string;
  name: string;
  premium: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  type: 'Life' | 'Health' | 'Term' | 'Vehicle' | 'Home';
  coverAmount: number;
  dueDate: number;
}

interface InvestmentInsuranceProps {
  sips: SIP[];
  setSips: React.Dispatch<React.SetStateAction<SIP[]>>;
  insurances: Insurance[];
  setInsurances: React.Dispatch<React.SetStateAction<Insurance[]>>;
  totalIncome: number;
}

export function InvestmentInsurance({ sips, setSips, insurances, setInsurances, totalIncome }: InvestmentInsuranceProps) {
  const [isAddingSIP, setIsAddingSIP] = useState(false);
  const [isAddingInsurance, setIsAddingInsurance] = useState(false);
  const [newSIP, setNewSIP] = useState<Partial<SIP>>({
    frequency: 'Monthly',
    category: 'Equity',
    expectedReturn: 12
  });
  const [newInsurance, setNewInsurance] = useState<Partial<Insurance>>({
    frequency: 'Yearly',
    type: 'Life'
  });

  const handleAddSIP = () => {
    if (!newSIP.name || !newSIP.amount || !newSIP.startDate) {
      alert('Please fill all required fields');
      return;
    }

    const sip: SIP = {
      id: Date.now().toString(),
      name: newSIP.name,
      amount: Number(newSIP.amount),
      frequency: newSIP.frequency as 'Monthly' | 'Quarterly' | 'Yearly',
      category: newSIP.category as any,
      startDate: newSIP.startDate,
      expectedReturn: Number(newSIP.expectedReturn) || 12
    };

    setSips([...sips, sip]);
    setNewSIP({ frequency: 'Monthly', category: 'Equity', expectedReturn: 12 });
    setIsAddingSIP(false);
  };

  const handleAddInsurance = () => {
    if (!newInsurance.name || !newInsurance.premium || !newInsurance.coverAmount || !newInsurance.dueDate) {
      alert('Please fill all required fields');
      return;
    }

    const insurance: Insurance = {
      id: Date.now().toString(),
      name: newInsurance.name,
      premium: Number(newInsurance.premium),
      frequency: newInsurance.frequency as any,
      type: newInsurance.type as any,
      coverAmount: Number(newInsurance.coverAmount),
      dueDate: Number(newInsurance.dueDate)
    };

    setInsurances([...insurances, insurance]);
    setNewInsurance({ frequency: 'Yearly', type: 'Life' });
    setIsAddingInsurance(false);
  };

  const handleDeleteSIP = (id: string) => {
    setSips(sips.filter(s => s.id !== id));
  };

  const handleDeleteInsurance = (id: string) => {
    setInsurances(insurances.filter(i => i.id !== id));
  };

  // Calculate monthly amounts
  const getMonthlySIPAmount = (sip: SIP) => {
    switch (sip.frequency) {
      case 'Monthly': return sip.amount;
      case 'Quarterly': return sip.amount / 3;
      case 'Yearly': return sip.amount / 12;
      default: return sip.amount;
    }
  };

  const getMonthlyInsuranceAmount = (insurance: Insurance) => {
    switch (insurance.frequency) {
      case 'Monthly': return insurance.premium;
      case 'Quarterly': return insurance.premium / 3;
      case 'Half-Yearly': return insurance.premium / 6;
      case 'Yearly': return insurance.premium / 12;
      default: return insurance.premium;
    }
  };

  const totalMonthlySIP = sips.reduce((sum, sip) => sum + getMonthlySIPAmount(sip), 0);
  const totalMonthlyInsurance = insurances.reduce((sum, ins) => sum + getMonthlyInsuranceAmount(ins), 0);
  const totalMonthlyInvestment = totalMonthlySIP + totalMonthlyInsurance;

  const sipPercentage = totalIncome > 0 ? (totalMonthlySIP / totalIncome * 100) : 0;
  const insurancePercentage = totalIncome > 0 ? (totalMonthlyInsurance / totalIncome * 100) : 0;
  const totalInvestmentPercentage = totalIncome > 0 ? (totalMonthlyInvestment / totalIncome * 100) : 0;

  // SIP by category
  const sipByCategory = sips.reduce((acc, sip) => {
    const monthly = getMonthlySIPAmount(sip);
    acc[sip.category] = (acc[sip.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  const sipCategoryData = Object.entries(sipByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Insurance by type
  const insuranceByType = insurances.reduce((acc, ins) => {
    const monthly = getMonthlyInsuranceAmount(ins);
    acc[ins.type] = (acc[ins.type] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  const insuranceTypeData = Object.entries(insuranceByType).map(([name, value]) => ({
    name,
    value
  }));

  // Total coverage
  const totalCoverage = insurances.reduce((sum, ins) => sum + ins.coverAmount, 0);

  // Future value calculation for SIPs (assuming 10 years)
  const calculateFutureValue = (sip: SIP) => {
    const monthlyAmount = getMonthlySIPAmount(sip);
    const monthlyRate = sip.expectedReturn / 12 / 100;
    const months = 120; // 10 years
    const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return Math.round(futureValue);
  };

  const totalFutureValue = sips.reduce((sum, sip) => sum + calculateFutureValue(sip), 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Investment breakdown
  const investmentBreakdown = [
    { name: 'SIPs', value: totalMonthlySIP, fill: '#3b82f6' },
    { name: 'Insurance', value: totalMonthlyInsurance, fill: '#10b981' },
    { name: 'Remaining', value: Math.max(0, totalIncome - totalMonthlyInvestment), fill: '#e2e8f0' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Monthly SIPs</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">₹{totalMonthlySIP.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">{sipPercentage.toFixed(1)}% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Monthly Insurance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-green-600">₹{totalMonthlyInsurance.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">{insurancePercentage.toFixed(1)}% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Investment</CardTitle>
            <LineChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-purple-600">₹{totalMonthlyInvestment.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">{totalInvestmentPercentage.toFixed(1)}% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Coverage</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-orange-600">₹{(totalCoverage / 100000).toFixed(1)}L</div>
            <p className="text-slate-600 mt-1">Insurance coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Recommendation Alert */}
      {totalInvestmentPercentage < 20 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-orange-900">Investment Recommendation</h3>
                <p className="text-orange-700 mt-1">
                  You're investing {totalInvestmentPercentage.toFixed(1)}% of your income. 
                  Financial advisors recommend investing at least 20-30% for long-term wealth creation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>SIPs (Recommended: 15-20%)</span>
                <span className="text-blue-600">
                  ₹{totalMonthlySIP.toLocaleString('en-IN')} ({sipPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={Math.min(sipPercentage * 5, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Insurance (Recommended: 5-10%)</span>
                <span className="text-green-600">
                  ₹{totalMonthlyInsurance.toLocaleString('en-IN')} ({insurancePercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={Math.min(insurancePercentage * 10, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income vs Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={investmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {investmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SIP by Category */}
        {sipCategoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>SIP by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sipCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${Math.round(value).toLocaleString('en-IN')}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sipCategoryData.map((entry, index) => (
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
      </div>

      {/* SIPs Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Systematic Investment Plans (SIPs)</CardTitle>
              <p className="text-slate-600 mt-1">
                Total future value in 10 years: ₹{(totalFutureValue / 100000).toFixed(1)}L (estimated)
              </p>
            </div>
            <Dialog open={isAddingSIP} onOpenChange={setIsAddingSIP}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add SIP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New SIP</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Add a systematic investment plan to track your investments.
                </DialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="sipName">SIP Name</Label>
                    <Input
                      id="sipName"
                      placeholder="e.g., HDFC Index Fund"
                      value={newSIP.name || ''}
                      onChange={(e) => setNewSIP({ ...newSIP, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sipCategory">Category</Label>
                    <Select
                      value={newSIP.category}
                      onValueChange={(value) => setNewSIP({ ...newSIP, category: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Debt">Debt</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Index Fund">Index Fund</SelectItem>
                        <SelectItem value="ELSS">ELSS (Tax Saving)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sipAmount">Investment Amount (₹)</Label>
                    <Input
                      id="sipAmount"
                      type="number"
                      placeholder="5000"
                      value={newSIP.amount || ''}
                      onChange={(e) => setNewSIP({ ...newSIP, amount: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sipFrequency">Frequency</Label>
                    <Select
                      value={newSIP.frequency}
                      onValueChange={(value) => setNewSIP({ ...newSIP, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sipStartDate">Start Date</Label>
                    <Input
                      id="sipStartDate"
                      type="date"
                      value={newSIP.startDate || ''}
                      onChange={(e) => setNewSIP({ ...newSIP, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectedReturn">Expected Return (% p.a.)</Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.5"
                      placeholder="12"
                      value={newSIP.expectedReturn || ''}
                      onChange={(e) => setNewSIP({ ...newSIP, expectedReturn: Number(e.target.value) })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddSIP} className="flex-1">
                      Add SIP
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingSIP(false)}
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
          {sips.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No SIPs added yet. Start investing for your future!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sips.map(sip => {
                const monthlyAmount = getMonthlySIPAmount(sip);
                const futureValue = calculateFutureValue(sip);
                
                return (
                  <div 
                    key={sip.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900">{sip.name}</p>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                          {sip.category}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        ₹{sip.amount.toLocaleString('en-IN')} {sip.frequency} • 
                        Started: {new Date(sip.startDate).toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-green-600">
                        Expected: ₹{(futureValue / 100000).toFixed(1)}L in 10 years @ {sip.expectedReturn}% p.a.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-blue-600">
                          ₹{monthlyAmount.toLocaleString('en-IN')}/mo
                        </div>
                        <p className="text-slate-600">
                          {((monthlyAmount / totalIncome) * 100).toFixed(1)}% of income
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSIP(sip.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Insurance Policies</CardTitle>
              <p className="text-slate-600 mt-1">
                Total coverage: ₹{(totalCoverage / 100000).toFixed(1)}L
              </p>
            </div>
            <Dialog open={isAddingInsurance} onOpenChange={setIsAddingInsurance}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Insurance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Insurance</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Add an insurance policy to track your coverage and premiums.
                </DialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="insuranceName">Policy Name</Label>
                    <Input
                      id="insuranceName"
                      placeholder="e.g., HDFC Term Life"
                      value={newInsurance.name || ''}
                      onChange={(e) => setNewInsurance({ ...newInsurance, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="insuranceType">Insurance Type</Label>
                    <Select
                      value={newInsurance.type}
                      onValueChange={(value) => setNewInsurance({ ...newInsurance, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Life">Life Insurance</SelectItem>
                        <SelectItem value="Health">Health Insurance</SelectItem>
                        <SelectItem value="Term">Term Insurance</SelectItem>
                        <SelectItem value="Vehicle">Vehicle Insurance</SelectItem>
                        <SelectItem value="Home">Home Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="premium">Premium Amount (₹)</Label>
                    <Input
                      id="premium"
                      type="number"
                      placeholder="10000"
                      value={newInsurance.premium || ''}
                      onChange={(e) => setNewInsurance({ ...newInsurance, premium: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="insuranceFrequency">Payment Frequency</Label>
                    <Select
                      value={newInsurance.frequency}
                      onValueChange={(value) => setNewInsurance({ ...newInsurance, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="coverAmount">Coverage Amount (₹)</Label>
                    <Input
                      id="coverAmount"
                      type="number"
                      placeholder="10000000"
                      value={newInsurance.coverAmount || ''}
                      onChange={(e) => setNewInsurance({ ...newInsurance, coverAmount: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="insuranceDueDate">Premium Due Date (Day of Month)</Label>
                    <Input
                      id="insuranceDueDate"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      value={newInsurance.dueDate || ''}
                      onChange={(e) => setNewInsurance({ ...newInsurance, dueDate: Number(e.target.value) })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddInsurance} className="flex-1">
                      Add Insurance
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingInsurance(false)}
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
          {insurances.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No insurance policies added yet. Protect your family and assets!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insurances.map(insurance => {
                const monthlyPremium = getMonthlyInsuranceAmount(insurance);
                
                return (
                  <div 
                    key={insurance.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900">{insurance.name}</p>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                          {insurance.type}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Premium: ₹{insurance.premium.toLocaleString('en-IN')} {insurance.frequency} • 
                        Due: {insurance.dueDate}th
                      </p>
                      <p className="text-green-600">
                        Coverage: ₹{(insurance.coverAmount / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-green-600">
                          ₹{monthlyPremium.toLocaleString('en-IN')}/mo
                        </div>
                        <p className="text-slate-600">
                          {((monthlyPremium / totalIncome) * 100).toFixed(1)}% of income
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInsurance(insurance.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Investment & Insurance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
              <span>
                <strong>SIP Discipline:</strong> Start with at least 15% of income in SIPs. Increase by 10% every year with salary hike.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
              <span>
                <strong>Term Insurance:</strong> Get coverage of at least 10-15x your annual income (₹{((totalIncome * 12 * 10) / 100000).toFixed(0)}L-₹{((totalIncome * 12 * 15) / 100000).toFixed(0)}L recommended).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
              <span>
                <strong>Health Insurance:</strong> Get family floater of ₹10L-₹15L minimum. Critical illness rider is recommended.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
              <span>
                <strong>Tax Saving:</strong> ELSS (80C) + Health Insurance (80D) can save up to ₹60,000-₹70,000 in taxes annually.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-2" />
              <span>
                <strong>Asset Allocation:</strong> For 30-year-olds: 70% equity, 20% debt, 10% gold is a good starting point.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
