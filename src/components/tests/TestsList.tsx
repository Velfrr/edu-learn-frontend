import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Test } from '@/types/test';
import { FilePlus, Edit, Trash, ListCheck } from 'lucide-react';

interface TestsListProps {
  tests: Test[];
  onAdd: () => void;
  onEdit: (test: Test) => void;
  onDelete: (testId: string) => void;
}

const TestsList: React.FC<TestsListProps> = ({
  tests,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tests</h2>
          <p className="text-muted-foreground">
            Create and manage tests for your lessons
          </p>
        </div>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <FilePlus size={16} /> Add Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="rounded-full bg-muted p-3">
                <ListCheck size={24} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle>No Tests Yet</CardTitle>
                <p className="text-muted-foreground">
                  Create a test to assess student knowledge and progress
                </p>
              </div>
              <Button onClick={onAdd}>Add Your First Test</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Pass Percentage</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell>{test.minPassPercentage}%</TableCell>
                    <TableCell>0 questions</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(test)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(test.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestsList;
