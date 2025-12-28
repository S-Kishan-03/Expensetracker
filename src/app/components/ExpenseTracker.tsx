import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Transaction, BankAccount } from "../App";
import { Plus, Trash2, Calendar, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface ExpenseTrackerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  bankAccounts: BankAccount[];
}

export function ExpenseTracker({ transactions, setTransactions, bankAccounts }: ExpenseTrackerProps) {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>('all');
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'essential',
    paymentMode: 'UPI'
  });

  const categories = {
    essential: ['Groceries', 'Rent', 'Utilities', 'Healthcare', 'Transport', 'Insurance'],
    other: ['Entertainment', 'Dining Out', 'Shopping', 'Travel', 'Hobbies', 'Misc']
  };

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      alert('Please fill all required fields');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      amount: Number(newTransaction.amount),
      category: newTransaction.category,
      type: newTransaction.type as 'essential' | 'other' | 'income',
      paymentMode: newTransaction.paymentMode as 'UPI' | 'CC' | 'Cash' | 'Debit',
      bankAccount: newTransaction.bankAccount,
      description: newTransaction.description
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'essential',
      paymentMode: 'UPI'
    });
    setIsAddingTransaction(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterPaymentMode !== 'all' && t.paymentMode !== filterPaymentMode) return false;
    return true;
  });

  const groupedByDate = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daily Expense Tracker</CardTitle>
            <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Expense Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as any, category: undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essential">Essential</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(newTransaction.type === 'essential' ? categories.essential : categories.other).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    <Select
                      value={newTransaction.paymentMode}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMode: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CC">Credit Card</SelectItem>
                        <SelectItem value="Debit">Debit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newTransaction.paymentMode !== 'Cash' && (
                    <div>
                      <Label htmlFor="bankAccount">Bank Account</Label>
                      <Select
                        value={newTransaction.bankAccount}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, bankAccount: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map(account => (
                            <SelectItem key={account.id} value={account.name}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What did you spend on?"
                      value={newTransaction.description || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddTransaction} className="flex-1">
                      Add Transaction
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingTransaction(false)}
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
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700">Filters:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="essential">Essential</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPaymentMode} onValueChange={setFilterPaymentMode}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CC">Credit Card</SelectItem>
                <SelectItem value="Debit">Debit Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet. Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <h3 className="text-slate-900">
                      {new Date(date).toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <span className="text-slate-600">
                      (₹{groupedByDate[date].reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedByDate[date].map(transaction => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-white ${
                              transaction.type === 'essential' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}>
                              {transaction.type}
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-200 text-slate-700">
                              {transaction.paymentMode}
                            </span>
                            <span className="text-slate-700">{transaction.category}</span>
                          </div>
                          <p className="text-slate-900">{transaction.description}</p>
                          {transaction.bankAccount && (
                            <p className="text-slate-600">Account: {transaction.bankAccount}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-red-600">
                            -₹{transaction.amount.toLocaleString('en-IN')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">
              ₹{transactions
                .filter(t => t.date === new Date().toISOString().split('T')[0])
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">
              ₹{transactions
                .filter(t => {
                  const date = new Date(t.date);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                })
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">
              {filteredTransactions.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}