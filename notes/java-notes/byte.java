package p2;

public class S8  {
	
	    public static void main(String[] args) {
	        S7 t = new S7();
	        
	        t.m1((byte)5);  
	        t.m1((short)15); 
	    }
	
    
    public byte m1(byte a) {
    	 a = 10;
        System.out.println(a);
        return a;
    }
    
    
    
    public short m1(short a) {
     a = 20;
        System.out.println(a);
        return a;
        
        
        
    }
}
