import { Language } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', monacoId: 'javascript', icon: '🟨' },
  { id: 'typescript', name: 'TypeScript', monacoId: 'typescript', icon: '🔷' },
  { id: 'python', name: 'Python', monacoId: 'python', icon: '🐍' },
  { id: 'java', name: 'Java', monacoId: 'java', icon: '☕' },
  { id: 'cpp', name: 'C++', monacoId: 'cpp', icon: '⚙️' },
  { id: 'go', name: 'Go', monacoId: 'go', icon: '🐹' },
  { id: 'rust', name: 'Rust', monacoId: 'rust', icon: '🦀' },
  { id: 'csharp', name: 'C#', monacoId: 'csharp', icon: '💜' },
  { id: 'ruby', name: 'Ruby', monacoId: 'ruby', icon: '💎' },
  { id: 'php', name: 'PHP', monacoId: 'php', icon: '🐘' },
];

export const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript - Write your code here
console.log("Hello, CoCode! 👋");

// Try some code
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);
`,
  typescript: `// TypeScript - Write your code here
console.log("Hello, CoCode! 👋");

interface User {
  name: string;
  age: number;
}

const user: User = { name: "CoCode", age: 1 };
console.log("User:", user);
`,
  python: `# Python - Write your code here
print("Hello, CoCode! 👋")

# Try some code
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CoCode! 👋");
        
        // Try some code
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Doubled: ");
        for (int n : numbers) {
            System.out.print(n * 2 + " ");
        }
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, CoCode! 👋" << endl;
    
    // Try some code
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Doubled: ";
    for (int n : numbers) {
        cout << n * 2 << " ";
    }
    cout << endl;
    
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, CoCode! 👋")
    
    // Try some code
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Print("Doubled: ")
    for _, n := range numbers {
        fmt.Print(n*2, " ")
    }
    fmt.Println()
}
`,
  rust: `fn main() {
    println!("Hello, CoCode! 👋");
    
    // Try some code
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|n| n * 2).collect();
    println!("Doubled: {:?}", doubled);
}
`,
  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello, CoCode! 👋");
        
        // Try some code
        int[] numbers = {1, 2, 3, 4, 5};
        var doubled = numbers.Select(n => n * 2);
        Console.WriteLine("Doubled: " + string.Join(", ", doubled));
    }
}
`,
  ruby: `# Ruby - Write your code here
puts "Hello, CoCode! 👋"

# Try some code
numbers = [1, 2, 3, 4, 5]
doubled = numbers.map { |n| n * 2 }
puts "Doubled: #{doubled}"
`,
  php: `<?php
echo "Hello, CoCode! 👋\\n";

// Try some code
$numbers = [1, 2, 3, 4, 5];
$doubled = array_map(fn($n) => $n * 2, $numbers);
echo "Doubled: " . implode(", ", $doubled) . "\\n";
`,
};

// User colors for collaboration
export const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

export const getRandomColor = (): string => {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};

export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const generateUserName = (): string => {
  const adjectives = ['Happy', 'Swift', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle', 'Kind'];
  const nouns = ['Coder', 'Dev', 'Hacker', 'Ninja', 'Wizard', 'Master', 'Pro', 'Star'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
};
