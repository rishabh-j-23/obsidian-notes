- Static nested classes are commonly used to represent inner classes that do not require access to the outer class's instance members.
- A static nested class is not automatically instantiated when an instance of the outer (parent) class is created.

```java
public class OuterClass {
    // Static nested class
    public static class StaticNestedClass {
        public void display() {
            System.out.println("Inside Static Nested Class");
        }
    }

    public void outerMethod() {
        System.out.println("Inside Outer Class");
    }
}

public class Main {
    public static void main(String[] args) {
        // Creating object of static nested class using OuterClass name
        OuterClass.StaticNestedClass nested = new OuterClass.StaticNestedClass();
        nested.display();  // Output: Inside Static Nested Class

        // Creating object of outer class
        OuterClass outer = new OuterClass();
        outer.outerMethod();  // Output: Inside Outer Class
    }
}
```