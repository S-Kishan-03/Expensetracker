import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BankAccount, Transaction } from "../App";
import { Building2, CreditCard, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface BankAccountsProps {
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  transactions: Transaction[];
}

export function BankAccounts({ bankAccounts, setBankAccounts, transactions }: BankAccountsProps) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    type: 'Savings'
  });

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.balance) {
      alert('Please fill all required fields');
      return;
    }

    const account: BankAccount = {
      id: Date.now().toString(),
      name: newAccount.name,
      balance: Number(newAccount.balance),
      type: newAccount.type as 'Savings' | 'Current' | 'Credit Card',
      lastUpdated: new Date().toISOString()
    };

    setBankAccounts([...bankAccounts, account]);
    setNewAccount({ type: 'Savings' });
    setIsAddingAccount(false);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
    }
  };

  const handleUpdateBalance = (id: string, newBalance: number) => {
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id 
        ? { ...acc, balance: newBalance, lastUpdated: new Date().toISOString() }
        : acc
    ));
  };

  const getAccountTransactions = (accountName: string) => {
    return transactions.filter(t => t.bankAccount === accountName);
  };

  const totalSavings = bankAccounts
    .filter(acc => acc.type !== 'Credit Card')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalDebt = Math.abs(
    bankAccounts
      .filter(acc => acc.type === 'Credit Card')
      .reduce((sum, acc) => sum + acc.balance, 0)
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Bank Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">₹{totalSavings.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">
              Across {bankAccounts.filter(a => a.type !== 'Credit Card').length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Card Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">₹{totalDebt.toLocaleString('en-IN')}</div>
            <p className="text-slate-600 mt-1">
              Outstanding on {bankAccounts.filter(a => a.type === 'Credit Card').length} cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={totalSavings - totalDebt >= 0 ? 'text-green-600' : 'text-red-600'}>
              ₹{(totalSavings - totalDebt).toLocaleString('en-IN')}
            </div>
            <p className="text-slate-600 mt-1">Assets - Liabilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Account Button */}
      <div className="flex justify-end">
        <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account to your financial dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., HDFC Salary Account"
                  value={newAccount.name || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({ ...newAccount, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings">Savings Account</SelectItem>
                    <SelectItem value="Current">Current Account</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">
                  {newAccount.type === 'Credit Card' ? 'Outstanding Amount (-)' : 'Current Balance'}
                </Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="0"
                  value={newAccount.balance || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddAccount} className="flex-1">
                  Add Account
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingAccount(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bank Accounts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bankAccounts.map(account => {
          const accountTransactions = getAccountTransactions(account.name);
          const totalSpent = accountTransactions.reduce((sum, t) => sum + t.amount, 0);

          return (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {account.type === 'Credit Card' ? (
                      <CreditCard className="w-8 h-8 text-orange-600" />
                    ) : (
                      <Building2 className="w-8 h-8 text-blue-600" />
                    )}
                    <div>
                      <CardTitle>{account.name}</CardTitle>
                      <p className="text-slate-600 mt-1">{account.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Balance */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 mb-2">Current Balance</p>
                  <div className={`text-3xl ${account.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{Math.abs(account.balance).toLocaleString('en-IN')}
                    {account.balance < 0 && <span className="text-red-600"> (Due)</span>}
                  </div>
                  <p className="text-slate-500 mt-2">
                    Last updated: {new Date(account.lastUpdated).toLocaleDateString('en-IN')}
                  </p>
                </div>

                {/* Update Balance */}
                <div>
                  <Label htmlFor={`update-${account.id}`}>Update Balance</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id={`update-${account.id}`}
                      type="number"
                      placeholder="New balance"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          handleUpdateBalance(account.id, Number(input.value));
                          input.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).closest('div')?.querySelector('input');
                        if (input) {
                          handleUpdateBalance(account.id, Number(input.value));
                          input.value = '';
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                {/* Transaction Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-slate-600">Transactions</p>
                    <p className="text-blue-600">{accountTransactions.length}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-slate-600">Total Spent</p>
                    <p className="text-red-600">₹{totalSpent.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Recent Transactions */}
                {accountTransactions.length > 0 && (
                  <div>
                    <h4 className="mb-2">Recent Transactions</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {accountTransactions.slice(0, 5).map(transaction => (
                        <div 
                          key={transaction.id} 
                          className="flex items-center justify-between p-2 border rounded text-sm"
                        >
                          <div className="flex-1">
                            <p className="text-slate-900">{transaction.description}</p>
                            <p className="text-slate-600">
                              {new Date(transaction.date).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="text-red-600">
                            -₹{transaction.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bankAccounts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bank accounts added yet. Add your first account to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Account Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <span>
                Maintain a minimum balance in each account to avoid penalty charges
              </span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
              <span>
                Pay credit card bills before due date to avoid interest (typically 36-48% p.a.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <span>
                Keep emergency funds (3-6 months expenses) in a high-interest savings account
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
              <span>
                Limit credit card utilization to 30% of limit for better credit score
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}